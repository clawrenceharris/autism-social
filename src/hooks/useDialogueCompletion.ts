import { useState, useCallback } from "react";
import { useToast } from "../context";
import * as dialogueService from "../services/dialogues";
import { useStreakStore } from "../store/useStreakStore";
import type { DialogueContext } from "../xstate/dialogueMachine";
import useErrorHandler from "./useErrorHandler";

export const useDialogueCompletion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { incrementStreak } = useStreakStore();
  const { handleError } = useErrorHandler();
  const addDialogueProgress = useCallback(
    async (context: DialogueContext) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await dialogueService.completeDialogue({
          userId: context.user.user_id,
          dialogueId: context.dialogue.id,
          scores: context.totalScores,
        });

        // Update streak when dialogue is completed
        const streakResult = await incrementStreak(context.user.user_id);

        // Show streak notification if streak was incremented
        if (streakResult.streakIncremented) {
          showToast(
            `Daily Streak increased to ${streakResult.streakData.currentStreak}!`,
            {
              type: "success",
            }
          );
        }

        return result;
      } catch (error) {
        const err = handleError({ error, action: "complete dialogue" });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [incrementStreak, showToast, handleError]
  );

  return {
    addDialogueProgress,
    isLoading,
    error,
  };
};

export default useDialogueCompletion;
