import { assign, createMachine, fromPromise } from "xstate";
import type {
  ConversationMessage,
  DialoguePhase,
  ActorResponse,
  UserResponseAnalysis,
} from "../services/dynamicDialogue";
import type { Actor, Dialogue, ScoreSummary, UserProfile } from "../types";
import type { ResponseOutputItem } from "openai/resources/responses/responses.mjs";

// Machine context
export interface DialogueContext {
  // Core dialogue info
  dialogue: Dialogue;
  actor: Actor;
  userFields: { [key: string]: string };
  // User info
  user: UserProfile;
  responses: ResponseOutputItem[];
  // Conversation state

  conversationHistory: ConversationMessage[];
  currentPhase: DialoguePhase;
  // Current interaction
  currentActorResponse?: ActorResponse;
  currentUserInput?: string;
  currentUserAnalysis?: UserResponseAnalysis;

  // Context and scoring
  totalScores: ScoreSummary;

  // Error handling
  error?: string;
}

// Machine events
export type DialogueEvent =
  | { type: "START_DIALOGUE" }
  | { type: "SUBMIT_USER_RESPONSE"; input: string }
  | { type: "ACTOR_RESPONSE_READY"; response: ActorResponse }
  | { type: "END_DIALOGUE" }
  | { type: "RETRY" }
  | { type: "ERROR"; error: string };

// Services interface for dependency injection
export interface HybridDialogueServices {
  generateActorResponse: (context: DialogueContext) => Promise<ActorResponse>;
  analyzeUserResponse: (
    input: string,
    context: DialogueContext
  ) => Promise<UserResponseAnalysis>;
  shouldTransitionPhase: (context: DialogueContext) => Promise<{
    shouldTransition: boolean;
    nextPhase?: DialoguePhase;
  }>;
  onDialogueComplete: (context: DialogueContext) => Promise<void> | void;
}

/**
 * Create a hybrid dialogue machine that combines XState flow control with AI-generated responses
 */
export function createDialogueMachine(
  dialogue: Dialogue,
  actor: Actor,
  userFields: { [key: string]: string },
  services: HybridDialogueServices,
  user: UserProfile
) {
  return createMachine({
    types: {
      context: {} as DialogueContext,
      events: {} as DialogueEvent,
    },

    id: dialogue.id,

    initial: "waitingForStart",

    context: {
      userFields,
      responses: [],
      dialogue,
      actor,
      user,
      conversationHistory: [],
      currentPhase: "introduction",
      totalScores: {},
    },

    states: {
      waitingForStart: {
        on: {
          START_DIALOGUE: {
            target: "generatingActorResponse",
          },
        },
      },

      generatingActorResponse: {
        invoke: {
          id: "generateActorResponse",
          src: fromPromise(async ({ input }) => {
            return services.generateActorResponse(input);
          }),
          input: ({ context }) => context,
          onDone: {
            target: "waitingForUserInput",
            actions: [
              assign({
                currentActorResponse: ({ event }) => event.output,
                error: undefined,
              }),
              // Add actor message to conversation history
              assign({
                conversationHistory: ({ context, event }) => [
                  ...context.conversationHistory,
                  {
                    id: crypto.randomUUID(),
                    content: event.output.content,
                    speaker: "actor" as const,
                    phase: context.currentPhase,
                  },
                ],
              }),
            ],
          },
          onError: {
            target: "error",
            actions: assign({
              error: ({ event }) =>
                `Failed to generate actor response: ${event.error}`,
            }),
          },
        },
      },

      waitingForUserInput: {
        on: {
          SUBMIT_USER_RESPONSE: {
            target: "analyzingUserResponse",
            actions: assign({
              currentUserInput: ({ event }) => event.input,
            }),
          },

          END_DIALOGUE: {
            target: "completed",
          },
        },
      },

      analyzingUserResponse: {
        invoke: {
          src: fromPromise(async ({ input }) => {
            const { context, userInput } = input;

            return services.analyzeUserResponse(userInput, context);
          }),
          input: ({ context }) => ({
            userInput: context.currentUserInput,
            context,
          }),
          onDone: {
            target: "checkingPhaseTransition",
            actions: [
              assign({
                currentUserAnalysis: ({ event }) => event.output,
              }),
              assign({
                conversationHistory: ({ context, event }) => [
                  ...context.conversationHistory,
                  {
                    id: crypto.randomUUID(),
                    speaker: "user" as const,
                    content: context.currentUserInput!,
                    analysis: event.output, // ✅ Use event.output directly
                    phase: context.currentPhase,
                  } as ConversationMessage,
                ],
              }),

              // Update total scores
              assign({
                totalScores: ({ context, event }) => {
                  const newScores = event.output.scores;
                  return {
                    clarity:
                      (context.totalScores.clarity || 0) +
                      (newScores.clarity || 0),
                    empathy:
                      (context.totalScores.empathy || 0) +
                      (newScores.empathy || 0),
                    assertiveness:
                      (context.totalScores.assertiveness || 0) +
                      (newScores.assertiveness || 0),
                    social_awareness:
                      (context.totalScores.social_awareness || 0) +
                      (newScores.social_awareness || 0),
                    self_advocacy:
                      (context.totalScores.self_advocacy || 0) +
                      (newScores.self_advocacy || 0),
                  };
                },
              }),
            ],
          },
          onError: {
            target: "error",
            actions: assign({
              error: ({ event }) =>
                `Failed to analyze user response: ${event.error}`,
            }),
          },
        },
      },

      checkingPhaseTransition: {
        invoke: {
          id: "checkPhaseTransition",
          src: fromPromise(async ({ input }) => {
            // Check if the AI suggested a phase transition
            if (
              input.currentActorResponse?.nextPhase &&
              input.currentActorResponse.nextPhase !== input.currentPhase
            ) {
              return {
                shouldTransition: true,
                nextPhase: input.currentActorResponse.nextPhase,
              };
            }

            // Otherwise, use the service to determine if we should transition
            return services.shouldTransitionPhase(input);
          }),
          input: ({ context }) => context,
          onDone: [
            {
              guard: ({ event }) =>
                event.output.shouldTransition &&
                event.output.nextPhase === "completed",
              target: "completed",
            },
            {
              guard: ({ event }) => event.output.shouldTransition,
              target: "generatingActorResponse",
              actions: assign({
                currentPhase: ({ event }) => event.output.nextPhase!,
              }),
            },
            {
              target: "generatingActorResponse",
            },
          ],
          onError: {
            target: "generatingActorResponse",
            actions: assign({
              error: ({ event }) =>
                `Phase transition check failed: ${event.error}`,
            }),
          },
        },
      },

      completed: {
        type: "final",

        invoke: {
          id: "completeDialogue",
          src: fromPromise(async ({ input }) => {
            if (services.onDialogueComplete) services.onDialogueComplete(input);
          }),
          input: ({ context }) => context,
        },
        entry: assign({
          currentPhase: "completed" as const,
        }),
      },

      error: {
        on: {
          END_DIALOGUE: {
            target: "completed",
          },
        },
      },
    },
  });
}

export type DialogueMachine = ReturnType<typeof createDialogueMachine>;
