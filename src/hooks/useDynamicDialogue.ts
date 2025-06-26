import { useCallback, useMemo, useRef } from "react";
import { useMachine } from "@xstate/react";
import {
  createDialogueMachine,
  type DialogueContext,
  type HybridDialogueServices,
} from "../xstate/createDialogueMachine";
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
  retry: () => void;

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
}

/**
 * Hook for managing hybrid dialogue interactions
 */
export const useDynamicDialogue = (
  options: UseDialogueOptions
): UseDialogueReturn => {
  const { dialogue, actor, user, userFields, onDialogueComplete } = options;

  // Initialize AI services
  const openai = useOpenAI();

  // Create dynamic dialogue service
  const dynamicDialogueService = useMemo(() => {
    return new DialogueService(openai);
  }, [openai]);

  // Define services for the XState machine
  const services: HybridDialogueServices = useMemo(
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
      onDialogueComplete: async (context) => {
        if (onDialogueComplete) return await onDialogueComplete(context);
      },
    }),
    [dynamicDialogueService, onDialogueComplete]
  );

  // Create the machine
  const machineRef = useRef(
    createDialogueMachine(dialogue, actor, userFields, services, user)
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

  const retry = useCallback(() => {
    send({ type: "RETRY" });
  }, [send]);

  // Computed state
  const isLoading =
    state.matches("generatingActorResponse") ||
    state.matches("analyzingUserResponse") ||
    state.matches("checkingPhaseTransition") ||
    state.matches("initializing");

  const isWaitingForUser = state.matches("waitingForUserInput");
  const isCompleted = useMemo(() => state.status === "done", [state.status]);
  const hasError = state.matches("error");

  return {
    // Machine state
    state,
    context: state.context,
    // Actions
    startDialogue,
    submitUserInput,
    endDialogue,
    retry,

    // Computed state
    isLoading,
    isWaitingForUser,
    isCompleted,
    hasError,
    currentActorResponse: state.context.currentActorResponse,
    currentUserAnalysis: state.context.currentUserAnalysis,
    conversationHistory: state.context.conversationHistory,
    currentPhase: state.context.currentPhase,
    totalScores: state.context.totalScores,
  };
};

export default useDynamicDialogue;
