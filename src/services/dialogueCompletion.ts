import { supabase } from "../lib/supabase";
import type { UserProgress } from "../types";

export interface DialogueScores {
  clarity?: number;
  empathy?: number;
  assertiveness?: number;
  socialAwareness?: number;
  selfAdvocacy?: number;
}

export interface DialoguePossibleScores {
  clarity: number;
  empathy: number;
  assertiveness: number;
  socialAwareness: number;
  selfAdvocacy: number;
}

export interface CompletionResult {
  success: boolean;
  previous_progress: UserProgress;
  new_progress: UserProgress;
  scores_earned: DialogueScores;
}

export interface ProgressPercentages {
  clarity: number;
  empathy: number;
  assertiveness: number;
  social_awareness: number;
  self_advocacy: number;
  overall: number;
  user_completed_dialogues: number;
  total_dialogues: number;
}

/**
 * Complete a dialogue and update user progress atomically
 * @param userId - The user's ID
 * @param dialogueId - The completed dialogue ID
 * @param earnedScores - The scores earned in this dialogue
 * @param possibleScores - The maximum possible scores for this dialogue
 * @returns Promise with completion result including before/after progress
 */
export async function completeDialogue(
  userId: string,
  dialogueId: string,
  earnedScores: DialogueScores,
  possibleScores: DialoguePossibleScores
): Promise<CompletionResult> {
  try {
    const { data, error } = await supabase.rpc("complete_dialogue", {
      p_user_id: userId,
      p_dialogue_id: dialogueId,
      p_earned_scores: earnedScores,
      p_possible_scores: possibleScores,
    });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error("Failed to complete dialogue");
    }

    return {
      success: data.success,
      previous_progress: data.previous_progress,
      new_progress: data.new_progress,
      scores_earned: data.scores_earned,
    };
  } catch (error) {
    console.error("Error completing dialogue:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while completing the dialogue"
    );
  }
}

/**
 * Get user progress percentages for display
 * @param userId - The user's ID
 * @returns Promise with progress percentages and stats
 */
export async function getProgressPercentages(
  userId: string
): Promise<ProgressPercentages> {
  try {
    const { data, error } = await supabase.rpc("get_progress_percentages", {
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as ProgressPercentages;
  } catch (error) {
    console.error("Error fetching progress percentages:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching progress"
    );
  }
}

/**
 * Check if a dialogue has been completed by the user
 * @param userId - The user's ID
 * @param dialogueId - The dialogue ID to check
 * @returns Promise with boolean indicating completion status
 */
export async function isDialogueCompleted(
  userId: string,
  dialogueId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("user_completed_dialogues")
      .select("id")
      .eq("user_id", userId)
      .eq("dialogue_id", dialogueId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data !== null;
  } catch (error) {
    console.error("Error checking dialogue completion:", error);
    return false; // Fail gracefully
  }
}