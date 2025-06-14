import { DatabaseService } from "./database";
import type { UserProgress } from "../types";
import { supabase } from "../lib/supabase";

/**
 * Get user progress by user ID
 * @param userId - The user ID to get progress for
 * @returns Promise with user progress data or null if not found
 * @throws Error if database error occurs
 */
export async function getProgress(
  userId: string
): Promise<UserProgress | null> {
  const { data: result, error } =
    await DatabaseService.getMaybeSingleBy<UserProgress>(
      "user_progress",
      "user_id",
      userId
    );
  if (!result) {
    return await createProgress(userId);
  }
  if (error) {
    throw error;
  }

  return result;
}

/**
 * Create initial progress record for a user
 * @param userId - The user ID to create progress for
 * @returns Promise with created progress data
 * @throws Error if creation fails
 */
export async function createProgress(userId: string): Promise<UserProgress> {
  const { data: result, error } = await supabase
    .from("user_progress")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) {
    throw error || new Error("Failed to create progress");
  }

  return result;
}

/**
 * Update user progress
 * @param userId - The user ID to update progress for
 * @param updates - Partial progress data to update
 * @returns Promise with updated progress data
 * @throws Error if update fails
 */
export async function updateProgress(
  userId: string,
  updates: Partial<UserProgress>
): Promise<UserProgress> {
  const result = await DatabaseService.updateBy<UserProgress>(
    "user_progress",
    "user_id",
    userId,
    updates
  );

  if (result.error || !result.data || result.data.length === 0) {
    throw result.error || new Error("Failed to update progress");
  }

  return result.data[0];
}

/**
 * Calculate progress percentages for display
 * @param progress - User progress data
 * @returns Object with percentage values for each category
 */
export function calculateProgressPercentages(progress: UserProgress) {
  return {
    clarity: progress.clarity_possible > 0 
      ? Math.round((progress.clarity_earned / progress.clarity_possible) * 100) 
      : 0,
    empathy: progress.empathy_possible > 0 
      ? Math.round((progress.empathy_earned / progress.empathy_possible) * 100) 
      : 0,
    assertiveness: progress.assertiveness_possible > 0 
      ? Math.round((progress.assertiveness_earned / progress.assertiveness_possible) * 100) 
      : 0,
    social_awareness: progress.social_awareness_possible > 0 
      ? Math.round((progress.social_awareness_earned / progress.social_awareness_possible) * 100) 
      : 0,
    self_advocacy: progress.self_advocacy_possible > 0 
      ? Math.round((progress.self_advocacy_earned / progress.self_advocacy_possible) * 100) 
      : 0,
  };
}