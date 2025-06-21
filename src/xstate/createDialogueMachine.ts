import { assign, createMachine, type ActorRefFrom, fromPromise } from "xstate";
import type {
  DynamicDialogueContext,
  ConversationMessage,
  DialoguePhase,
  ActorResponse,
  UserResponseAnalysis,
} from "../services/dynamicDialogue";
import type { Actor, ScoreSummary } from "../types";
import type { PicaContextResponse } from "../services/pica";

// Machine context
export interface HybridDialogueContext {
  // Core dialogue info
  scenarioTitle: string;
  dialogueTitle: string;
  actor: Actor;

  // User info
  userProfile?: {
    name: string;
    interests: string[];
    goals: string[];
  };

  // Conversation state
  conversationHistory: ConversationMessage[];
  currentPhase: DialoguePhase;

  // Current interaction
  currentActorResponse?: ActorResponse;
  currentUserInput?: string;
  currentUserAnalysis?: UserResponseAnalysis;

  // Context and scoring
  picaContext?: PicaContextResponse;
  totalScores: ScoreSummary;
  maxPossibleScores: ScoreSummary;

  // Error handling
  error?: string;
}

// Machine events
export type HybridDialogueEvent =
  | { type: "START_DIALOGUE" }
  | { type: "SUBMIT_USER_INPUT"; input: string }
  | { type: "SELECT_SUGGESTED_RESPONSE"; responseId: string }
  | { type: "ACTOR_RESPONSE_READY"; response: ActorResponse }
  | { type: "USER_ANALYSIS_READY"; analysis: UserResponseAnalysis }
  | { type: "CONTEXT_UPDATED"; context: PicaContextResponse }
  | { type: "TRANSITION_PHASE"; nextPhase: DialoguePhase }
  | { type: "END_DIALOGUE" }
  | { type: "RETRY" }
  | { type: "ERROR"; error: string };

// Services interface for dependency injection
export interface HybridDialogueServices {
  generateActorResponse: (
    context: DynamicDialogueContext
  ) => Promise<ActorResponse>;
  analyzeUserResponse: (
    input: string,
    context: DynamicDialogueContext
  ) => Promise<UserResponseAnalysis>;
  fetchPicaContext: (
    scenarioTitle: string,
    dialogueTitle: string
  ) => Promise<PicaContextResponse>;
  shouldTransitionPhase: (context: DynamicDialogueContext) => Promise<{
    shouldTransition: boolean;
    nextPhase?: DialoguePhase;
    reason?: string;
  }>;
}

/**
 * Create a hybrid dialogue machine that combines XState flow control with AI-generated responses
 */
export function createHybridDialogueMachine(
  scenarioTitle: string,
  dialogueTitle: string,
  actor: Actor,
  services: HybridDialogueServices,
  userProfile?: {
    name: string;
    interests: string[];
    goals: string[];
  }
) {
  return createMachine(
    {
      types: {
        context: {} as HybridDialogueContext,
        events: {} as HybridDialogueEvent,
      },

      id: "hybridDialogue",

      initial: "initializing",

      context: {
        scenarioTitle,
        dialogueTitle,
        actor,
        userProfile,
        conversationHistory: [],
        currentPhase: "introduction",
        totalScores: {
          clarity: 0,
          empathy: 0,
          assertiveness: 0,
          social_awareness: 0,
          self_advocacy: 0,
        },
        maxPossibleScores: {
          clarity: 0,
          empathy: 0,
          assertiveness: 0,
          social_awareness: 0,
          self_advocacy: 0,
        },
      },

      states: {
        initializing: {
          invoke: {
            id: "fetchInitialContext",
            src: "fetchPicaContext",
            input: ({ context }) => ({
              scenarioTitle: context.scenarioTitle,
              dialogueTitle: context.dialogueTitle,
            }),
            onDone: {
              target: "waitingForStart",
              actions: assign({
                picaContext: ({ event }) => event.output,
              }),
            },
            onError: {
              target: "waitingForStart",
              actions: assign({
                error: ({ event }) => `Failed to fetch context: ${event.error}`,
              }),
            },
          },
        },

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
            src: "generateActorResponse",
            input: ({ context }): DynamicDialogueContext => ({
              scenarioTitle: context.scenarioTitle,
              dialogueTitle: context.dialogueTitle,
              actor: context.actor,
              conversationHistory: context.conversationHistory,
              currentPhase: context.currentPhase,
              userProfile: context.userProfile,
              picaContext: context.picaContext,
            }),
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
                      speaker: "actor" as const,
                      content: event.output.content,
                      timestamp: new Date(),
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
            SUBMIT_USER_INPUT: {
              target: "analyzingUserResponse",
              actions: assign({
                currentUserInput: ({ event }) => event.input,
              }),
            },

            SELECT_SUGGESTED_RESPONSE: {
              target: "processingSelectedResponse",
              actions: assign({
                currentUserInput: ({ context, event }) => {
                  const response =
                    context.currentActorResponse?.suggestedUserResponses.find(
                      (r) => r.id === event.responseId
                    );
                  return response?.content || "";
                },
              }),
            },

            CONTEXT_UPDATED: {
              actions: assign({
                picaContext: ({ event }) => event.context,
              }),
            },

            END_DIALOGUE: {
              target: "completed",
            },
          },
        },

        analyzingUserResponse: {
          invoke: {
            id: "analyzeUserResponse",
            src: "analyzeUserResponse",
            input: ({ context }) => ({
              input: context.currentUserInput!,
              dialogueContext: {
                scenarioTitle: context.scenarioTitle,
                dialogueTitle: context.dialogueTitle,
                actor: context.actor,
                conversationHistory: context.conversationHistory,
                currentPhase: context.currentPhase,
                userProfile: context.userProfile,
                picaContext: context.picaContext,
              } as DynamicDialogueContext,
            }),
            onDone: {
              target: "checkingPhaseTransition",
              actions: [
                assign({
                  currentUserAnalysis: ({ event }) => event.output,
                }),
                // Add user message to conversation history with scores
                assign({
                  conversationHistory: ({ context, event }) => [
                    ...context.conversationHistory,
                    {
                      id: crypto.randomUUID(),
                      speaker: "user" as const,
                      content: context.currentUserInput!,
                      timestamp: new Date(),
                      scores: event.output.scores,
                      phase: context.currentPhase,
                    },
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
                  maxPossibleScores: ({ context }) => {
                    return {
                      clarity: (context.maxPossibleScores.clarity || 0) + 10,
                      empathy: (context.maxPossibleScores.empathy || 0) + 10,
                      assertiveness:
                        (context.maxPossibleScores.assertiveness || 0) + 10,
                      social_awareness:
                        (context.maxPossibleScores.social_awareness || 0) + 10,
                      self_advocacy:
                        (context.maxPossibleScores.self_advocacy || 0) + 10,
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

        processingSelectedResponse: {
          entry: assign({
            currentUserAnalysis: ({ context }) => {
              const response =
                context.currentActorResponse?.suggestedUserResponses.find(
                  (r) => r.content === context.currentUserInput
                );

              if (response) {
                return {
                  scores: response.scores,
                  feedback: response.reasoning,
                  strengths: ["Used suggested response effectively"],
                  improvements: [],
                };
              }

              return undefined;
            },
          }),

          always: {
            target: "checkingPhaseTransition",
            actions: [
              // Add user message to conversation history
              assign({
                conversationHistory: ({ context }) => [
                  ...context.conversationHistory,
                  {
                    id: crypto.randomUUID(),
                    speaker: "user" as const,
                    content: context.currentUserInput!,
                    timestamp: new Date(),
                    scores: context.currentUserAnalysis?.scores,
                    phase: context.currentPhase,
                  },
                ],
              }),
              // Update total scores
              assign({
                totalScores: ({ context }) => {
                  const newScores = context.currentUserAnalysis?.scores || {};
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
                maxPossibleScores: ({ context }) => {
                  return {
                    clarity: (context.maxPossibleScores.clarity || 0) + 10,
                    empathy: (context.maxPossibleScores.empathy || 0) + 10,
                    assertiveness:
                      (context.maxPossibleScores.assertiveness || 0) + 10,
                    social_awareness:
                      (context.maxPossibleScores.social_awareness || 0) + 10,
                    self_advocacy:
                      (context.maxPossibleScores.self_advocacy || 0) + 10,
                  };
                },
              }),
            ],
          },
        },

        checkingPhaseTransition: {
          invoke: {
            id: "checkPhaseTransition",
            src: "shouldTransitionPhase",
            input: ({ context }): DynamicDialogueContext => ({
              scenarioTitle: context.scenarioTitle,
              dialogueTitle: context.dialogueTitle,
              actor: context.actor,
              conversationHistory: context.conversationHistory,
              currentPhase: context.currentPhase,
              userProfile: context.userProfile,
              picaContext: context.picaContext,
            }),
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
          entry: assign({
            currentPhase: "completed" as const,
          }),
        },

        error: {
          on: {
            RETRY: {
              target: "generatingActorResponse",
              actions: assign({
                error: undefined,
              }),
            },

            END_DIALOGUE: {
              target: "completed",
            },
          },
        },
      },
    },
    {
      actors: {
        fetchPicaContext: fromPromise(
          async ({
            input,
          }: {
            input: { scenarioTitle: string; dialogueTitle: string };
          }) => {
            return services.fetchPicaContext(
              input.scenarioTitle,
              input.dialogueTitle
            );
          }
        ),
        generateActorResponse: fromPromise(
          async ({ input }: { input: DynamicDialogueContext }) => {
            return services.generateActorResponse(input);
          }
        ),
        analyzeUserResponse: fromPromise(
          async ({
            input,
          }: {
            input: { input: string; dialogueContext: DynamicDialogueContext };
          }) => {
            return services.analyzeUserResponse(
              input.input,
              input.dialogueContext
            );
          }
        ),
        shouldTransitionPhase: fromPromise(
          async ({ input }: { input: DynamicDialogueContext }) => {
            return services.shouldTransitionPhase(input);
          }
        ),
      },
    }
  );
}

export type HybridDialogueMachine = ReturnType<
  typeof createHybridDialogueMachine
>;
export type HybridDialogueActor = ActorRefFrom<HybridDialogueMachine>;
