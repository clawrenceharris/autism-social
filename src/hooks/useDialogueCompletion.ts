import { useState, useCallback } from "react";
import { useToast } from "../context";
import type { ScoreSummary, UserProgress, StreakUpdateResult } from "../types";
import * as dialogueService from "../services/dialogues";
import { useStreakStore } from "../store/useStreakStore";

interface UseDialogueCompletionOptions {
  onSuccess?: (result: UserProgress, streakResult?: StreakUpdateResult) => void;
  onError?: (error: string) => void;
}

export const useDialogueCompletion = (
  options: UseDialogueCompletionOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { incrementStreak } = useStreakStore();

  const addDialogueProgress = useCallback(
    async (userId: string, dialogueId: string, scoring: ScoreSummary) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await dialogueService.upsertDialogueProgress({
          userId,
          dialogueId,
          scoring,
        });

        // Update streak when dialogue is completed
        const streakResult = await incrementStreak(userId);

        // Show streak notification if streak was incremented
        if (streakResult.streakIncremented) {
          showToast(
            `🔥Daily Streak increased to ${streakResult.streakData.currentStreak}!`,
            {
              type: "success",
            }
          );
        }

        if (options.onSuccess && result) {
          options.onSuccess(result, streakResult);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to complete dialogue";
        setError(errorMessage);

        if (options.onError) {
          options.onError(errorMessage);
        }

        showToast(errorMessage, { type: "error" });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options, showToast, incrementStreak]
  );

  return {
    addDialogueProgress,
    isLoading,
    error,
  };
};

export default useDialogueCompletion;
