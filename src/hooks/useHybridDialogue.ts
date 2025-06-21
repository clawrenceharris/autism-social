import { useCallback, useEffect, useMemo } from "react";
import { useMachine } from "@xstate/react";
import {
  createDialogueMachine,
  type HybridDialogueServices,
} from "../xstate/createDialogueMachine";
import { DynamicDialogueService } from "../services/dynamicDialogue";
import { usePicaContext } from "./usePicaContext";
import { useGemini } from "./useGemini";
import type { Actor } from "../types";

interface UseHybridDialogueOptions {
  scenarioTitle: string;
  dialogueTitle: string;
  actor: Actor;
  userProfile?: {
    name: string;
    interests: string[];
    goals: string[];
  };
  onDialogueComplete?: (finalScores: any) => void;
  onError?: (error: string) => void;
}

interface UseHybridDialogueReturn {
  // Machine state
  state: any;
  context: any;

  // Actions
  startDialogue: () => void;
  submitUserInput: (input: string) => void;
  selectSuggestedResponse: (responseId: string) => void;
  endDialogue: () => void;
  retry: () => void;

  // Computed state
  isLoading: boolean;
  isWaitingForUser: boolean;
  isCompleted: boolean;
  hasError: boolean;
  currentActorResponse: any;
  currentUserAnalysis: any;
  conversationHistory: any[];
  currentPhase: string;
  totalScores: any;

  // Context management
  updateContext: (newContext: any) => void;
}

/**
 * Hook for managing hybrid dialogue interactions
 */
export const useHybridDialogue = (
  options: UseHybridDialogueOptions
): UseHybridDialogueReturn => {
  const {
    scenarioTitle,
    dialogueTitle,
    actor,
    userProfile,
    onDialogueComplete,
    onError,
  } = options;

  // Initialize AI services
  const gemini = useGemini({
    temperature: 0.7,
    maxOutputTokens: 2048,
  });

  const picaContext = usePicaContext({
    cacheResults: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });

  // Create dynamic dialogue service
  const dynamicDialogueService = useMemo(() => {
    return new DynamicDialogueService(gemini);
  }, [gemini]);

  // Define services for the XState machine
  const services: HybridDialogueServices = useMemo(
    () => ({
      fetchPicaContext: async (
        scenarioTitle: string,
        dialogueTitle: string
      ) => {
        return await picaContext.getDialogueContext(
          scenarioTitle,
          dialogueTitle
        );
      },

      generateActorResponse: async (context) => {
        return await dynamicDialogueService.generateActorResponse(context);
      },

      analyzeUserResponse: async (input: string, context) => {
        return await dynamicDialogueService.analyzeUserResponse(input, context);
      },

      shouldTransitionPhase: async (context) => {
        return await dynamicDialogueService.shouldTransitionPhase(context);
      },
    }),
    [dynamicDialogueService, picaContext]
  );

  // Create the machine
  const machine = useMemo(() => {
    return createDialogueMachine(
      scenarioTitle,
      dialogueTitle,
      actor,
      services,
      userProfile
    );
  }, [scenarioTitle, dialogueTitle, actor, services, userProfile]);

  // Use the machine
  const [state, send] = useMachine(machine);

  // Handle dialogue completion
  useEffect(() => {
    if (state.matches("completed") && onDialogueComplete) {
      onDialogueComplete({
        totalScores: state.context.totalScores,
        maxPossibleScores: state.context.maxPossibleScores,
        conversationHistory: state.context.conversationHistory,
      });
    }
  }, [state, onDialogueComplete]);

  // Handle errors
  useEffect(() => {
    if (state.matches("error") && state.context.error && onError) {
      onError(state.context.error);
    }
  }, [state, onError]);

  // Action creators
  const startDialogue = useCallback(() => {
    send({ type: "START_DIALOGUE" });
  }, [send]);

  const submitUserInput = useCallback(
    (input: string) => {
      send({ type: "SUBMIT_USER_INPUT", input });
    },
    [send]
  );

  const selectSuggestedResponse = useCallback(
    (responseId: string) => {
      send({ type: "SELECT_SUGGESTED_RESPONSE", responseId });
    },
    [send]
  );

  const endDialogue = useCallback(() => {
    send({ type: "END_DIALOGUE" });
  }, [send]);

  const retry = useCallback(() => {
    send({ type: "RETRY" });
  }, [send]);

  const updateContext = useCallback(
    (newContext: any) => {
      send({ type: "CONTEXT_UPDATED", context: newContext });
    },
    [send]
  );

  // Computed state
  const isLoading =
    state.matches("generatingActorResponse") ||
    state.matches("analyzingUserResponse") ||
    state.matches("checkingPhaseTransition") ||
    state.matches("initializing");

  const isWaitingForUser = state.matches("waitingForUserInput");
  const isCompleted = state.matches("completed");
  const hasError = state.matches("error");

  return {
    // Machine state
    state,
    context: state.context,

    // Actions
    startDialogue,
    submitUserInput,
    selectSuggestedResponse,
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

    // Context management
    updateContext,
  };
};

export default useHybridDialogue;
