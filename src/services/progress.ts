import { DatabaseService } from "./database";
import type { UserProgress } from "../types";
import { supabase } from "../lib/supabase";

/**
 * Get user progress by user ID
 * @param userId - The user ID to get progress for
 * @returns Promise with user progress data or null if not found
 * @throws Error if database error occurs
 */
export async function getProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await DatabaseService.get<UserProgress>(
    "user_progress",

    { foreignKey: "user_id", foreignValue: userId }
  );
  if (!data) {
    throw new Error("User progress not found");
  }
  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get user progress by dialogue ID
 * @param dialogueId - The dialogue ID to get progress for
 * @returns Promise with user progress data or null if not found
 * @throws Error if database error occurs
 */
export async function getProgressByDialogueId(
  dialogueId: string
): Promise<UserProgress[]> {
  const { data, error } = await DatabaseService.get<UserProgress>(
    "user_progress",

    { foreignKey: "dialogue_id", foreignValue: dialogueId }
  );
  if (!data) {
    throw new Error("User progress not found");
  }
  if (error) {
    throw error;
  }

  return data;
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

  if (result.error || !result.data) {
    throw result.error || new Error("Failed to update progress");
  }

  return result.data;
}
