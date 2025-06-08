import { DatabaseService } from "./database";
import type { UserProgress } from "../types";

/**
 * Get user progress by user ID
 * @param userId - The user ID to get progress for
 * @returns Promise with user progress data or null if not found
 * @throws Error if database error occurs
 */
export async function getProgress(userId: string): Promise<UserProgress | null> {
  const {data, error} = await DatabaseService.getMaybeSingleBy<UserProgress>(
    "user_progress",
    "user_id",
    userId
  );
  if(!result){
    return await createProgress(userId);
  }
  if (error) {
    throw result.error;
  }

  return data;
}

/**
 * Get or create user progress - returns existing progress if found, creates new if not
 * @param userId - The user ID to get/create progress for
 * @returns Promise with progress data (existing or newly created)
 * @throws Error if operation fails
 */
export async function getOrCreateProgress(userId: string): Promise<UserProgress> {
  console.log("adding")
  const existingProgress = await getProgress(userId);
  if(!existingProgress)
    // If no progress exists, create new one
    return await createProgress(userId);
}

/**
 * Create initial progress record for a user
 * @param userId - The user ID to create progress for
 * @return  s Promise with created progress data
 * @throws Error if creation fails
 */
export async function createProgress(userId: string): Promise<UserProgress> {
   const { data:result, error } = await supabase
      .from("user_progress")
      .insert({
    user_id: userId,
    clarity: 0,
    empathy: 0,
    assertiveness: 0,
    social_awareness: 0,
    self_advocacy: 0,
  } as UserProgress)
      .select()
      .single()
      .upsert({ user_id: userId }, { onConflict: "user_id" });
\  if (result.error || !result.data) {
    throw result.error || new Error("Failed to create progress");
  }

  return result.data;
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