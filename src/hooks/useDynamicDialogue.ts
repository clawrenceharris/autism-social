import { useCallback, useEffect, useMemo } from "react";
import { useMachine } from "@xstate/react";
import {
  createDialogueMachine,
  type DialogueContext,
  type HybridDialogueServices,
} from "../xstate/createDialogueMachine";
import {
  DynamicDialogueService,
  type ActorResponse,
  type ConversationMessage,
  type DialoguePhase,
  type UserResponseAnalysis,
} from "../services/dynamicDialogue";
import { usePicaContext } from "./usePicaContext";
import { useGemini } from "./useGemini";
import type { Actor, ScoreSummary, UserProfile } from "../types";
import type { PicaContextResponse } from "../services/pica";

interface UseDialogueOptions {
  scenarioTitle: string;
  dialogueTitle: string;
  actor: Actor;
  user: UserProfile;
  onDialogueComplete?: (finalScores: object) => void;
  onError?: (error: string) => void;
}

interface UseDialogueReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any; // Machine state
  context: DialogueContext;

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
  currentActorResponse?: ActorResponse;
  currentUserAnalysis?: UserResponseAnalysis;
  conversationHistory: ConversationMessage[];
  currentPhase: DialoguePhase;
  totalScores: ScoreSummary;

  // Context management
  updateContext: (newContext: PicaContextResponse) => void;
}

/**
 * Hook for managing hybrid dialogue interactions
 */
export const useDynamicDialogue = (
  options: UseDialogueOptions
): UseDialogueReturn => {
  const {
    scenarioTitle,
    dialogueTitle,
    actor,
    user,
    onDialogueComplete,
    onError,
  } = options;

  // Initialize AI services
  const gemini = useGemini({
    temperature: 0.7,
    maxOutputTokens: 1048,
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
      user
    );
  }, [scenarioTitle, dialogueTitle, actor, services, user]);

  // Use the machine
  const [state, send] = useMachine(machine);

  // Handle dialogue completion
  useEffect(() => {
    if (state.status === "done" && onDialogueComplete) {
      onDialogueComplete({
        totalScores: state.context.totalScores,
        maxPossibleScores: state.context.maxPossibleScores,
        conversationHistory: state.context.conversationHistory,
      });
    }
  }, [
    state.status,
    onDialogueComplete,
    state.context.totalScores,
    state.context.maxPossibleScores,
    state.context.conversationHistory,
  ]);

  // Handle errors
  useEffect(() => {
    if (state.status === "error" && state.context.error && onError) {
      onError(state.context.error);
    }
  }, [state.status, onError, state.context.error]);

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
    (newContext: PicaContextResponse) => {
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

export default useDynamicDialogue;
