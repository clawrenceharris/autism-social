import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@xstate/react";
import {
  dialogueMachine,
  type DialogueContext,
  type DialogueServices,
} from "../xstate/dialogueMachine";
import {
  DialogueService,
  type ActorResponse,
  type ConversationMessage,
  type DialoguePhase,
  type UserResponseAnalysis,
} from "../services/dynamicDialogue";
import type {
  Actor,
  Dialogue,
  Scenario,
  ScoreSummary,
  UserProfile,
} from "../types";
import useOpenAI from "./useOpenAI";
import useDialogueCompletion from "./useDialogueCompletion";

interface UseDialogueOptions {
  scenario: Scenario;
  dialogue: Dialogue;
  actor: Actor;
  userFields: { [key: string]: string };
  user: UserProfile;
  onDialogueComplete?: (context: DialogueContext) => Promise<void> | void;
  onError?: (error: string) => void;
}

interface UseDialogueReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any; // Machine state
  context: DialogueContext;
  // Actions
  startDialogue: () => void;
  submitUserInput: (input: string) => void;
  endDialogue: () => void;

  // Computed state
  isLoading: boolean;
  isWaitingForUser: boolean;
  isCompleted: boolean;
  hasError: boolean;
  currentActorResponse?: ActorResponse;
  currentUserAnalysis?: UserResponseAnalysis;
  conversationHistory: ConversationMessage[];
  currentPhase: DialoguePhase;
  totalScores: ScoreSummary;
  isSaving: boolean;
}

/**
 * Hook for managing hybrid dialogue interactions
 */
export const useDynamicDialogue = (
  options: UseDialogueOptions
): UseDialogueReturn => {
  const { dialogue, actor, user, userFields } = options;
  const { addDialogueProgress, isLoading: isSaving } = useDialogueCompletion();
  // Initialize AI services
  const openai = useOpenAI();

  // Create dynamic dialogue service
  const dynamicDialogueService = useMemo(() => {
    return new DialogueService(openai);
  }, [openai]);

  // Define services for the XState machine
  const services: DialogueServices = useMemo(
    () => ({
      generateActorResponse: async (context) => {
        return await dynamicDialogueService.generateActorResponse(context);
      },

      analyzeUserResponse: async (input: string, context) => {
        return await dynamicDialogueService.analyzeUserResponse(input, context);
      },

      shouldTransitionPhase: async (context) => {
        return {
          shouldTransition: true,
          nextPhase:
            context.currentActorResponse?.nextPhase || context.currentPhase,
        };
      },
    }),
    [dynamicDialogueService]
  );

  // Create the machine
  const machineRef = useRef(
    dialogueMachine(dialogue, actor, userFields, services, user)
  );

  // Use the machine
  const [state, send] = useMachine(machineRef.current);

  // Action creators
  const startDialogue = useCallback(() => {
    send({ type: "START_DIALOGUE" });
  }, [send]);

  const submitUserInput = useCallback(
    (input: string) => {
      send({ type: "SUBMIT_USER_RESPONSE", input });
    },
    [send]
  );

  const endDialogue = useCallback(() => {
    send({ type: "END_DIALOGUE" });
  }, [send]);

  // Computed state
  const isLoading =
    state.matches("generatingActorResponse") ||
    state.matches("analyzingUserResponse") ||
    state.matches("checkingPhaseTransition") ||
    state.matches("initializing");

  const isWaitingForUser = state.matches("waitingForUserInput");
  const isCompleted = state.matches("completed");
  const hasError = state.matches("error");

  useEffect(() => {
    if (state.context.isCompleted) {
      addDialogueProgress(state.context);
      console.log("COMPLETED");
    }
  }, [isCompleted, state.context, addDialogueProgress]);
  return {
    // Machine state
    state,
    context: state.context,
    // Actions
    startDialogue,
    submitUserInput,
    endDialogue,

    // Computed state
    isLoading,
    isWaitingForUser,
    isCompleted,
    hasError,
    isSaving,
    currentActorResponse: state.context.currentActorResponse,
    currentUserAnalysis: state.context.currentUserAnalysis,
    conversationHistory: state.context.conversationHistory,
    currentPhase: state.context.currentPhase,
    totalScores: state.context.totalScores,
  };
};

export default useDynamicDialogue;
