import { useState, useCallback } from 'react';
import { completeDialogue, type DialogueScores, type CompletionResult } from '../services/dialogueCompletion';
import { useToast } from '../context';

interface UseDialogueCompletionOptions {
  onSuccess?: (result: CompletionResult) => void;
  onError?: (error: string) => void;
}

export const useDialogueCompletion = (options: UseDialogueCompletionOptions = {}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const complete = useCallback(async (
    userId: string,
    dialogueId: string,
    scores: DialogueScores
  ) => {
    setIsCompleting(true);
    setError(null);

    try {
      const result = await completeDialogue(userId, dialogueId, scores);
      setCompletionResult(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      showToast('Dialogue completed successfully! 🎉', { type: 'success' });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete dialogue';
      setError(errorMessage);
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      showToast(errorMessage, { type: 'error' });
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }, [options, showToast]);

  const reset = useCallback(() => {
    setCompletionResult(null);
    setError(null);
    setIsCompleting(false);
  }, []);

  return {
    complete,
    reset,
    isCompleting,
    completionResult,
    error,
    isCompleted: !!completionResult
  };
};

export default useDialogueCompletion;