import { useState, useCallback } from "react";
import { useToast } from "../context";
import type { ScoreSummary, UserProgress } from "../types";
import * as dialogueService from "../services/dialogues";
interface UseDialogueCompletionOptions {
  onSuccess?: (result: UserProgress) => void;
  onError?: (error: string) => void;
}

export const useDialogueCompletion = (
  options: UseDialogueCompletionOptions = {}
) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const addDialogueProgress = useCallback(
    async (userId: string, dialogueId: string, scores: ScoreSummary) => {
      setIsCompleting(true);
      setError(null);

      try {
        const result = await dialogueService.addDialogueProgress(
          userId,
          dialogueId,
          scores
        );

        if (options.onSuccess && result) {
          options.onSuccess(result);
        }

        showToast("Dialogue completed successfully! 🎉", { type: "success" });
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
        setIsCompleting(false);
      }
    },
    [options, showToast]
  );
  const updateDialogueProgress = useCallback(
    async (userId: string, dialogueId: string, scores: ScoreSummary) => {
      setIsCompleting(true);
      setError(null);

      try {
        const result = await dialogueService.updateDialogueProgress(
          userId,
          dialogueId,
          scores
        );

        if (options.onSuccess && result) {
          options.onSuccess(result);
        }

        showToast("Dialogue completed successfully! 🎉", { type: "success" });
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
        setIsCompleting(false);
      }
    },
    [options, showToast]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsCompleting(false);
  }, []);

  return {
    addDialogueProgress,
    updateDialogueProgress,
    reset,
    isCompleting,
    error,
  };
};

export default useDialogueCompletion;
