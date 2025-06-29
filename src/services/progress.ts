import { DatabaseService } from "./database";
import type { UserProgress } from "../types";

/**
 * Get user progress by user ID
 * @param userId - The user ID to get progress for
 * @returns Promise with user progress data or null if not found
 * @throws Error if database error occurs
 */
export async function getProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await DatabaseService.get<UserProgress>(
    "user_completed_dialogues",
    { foreignKey: "user_id", foreignValue: userId }
  );
  
  if (error) {
    throw error;
  }

  return data || [];
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
    "user_completed_dialogues",
    { foreignKey: "dialogue_id", foreignValue: dialogueId }
  );
  
  if (error) {
    throw error;
  }

  return data || [];
}