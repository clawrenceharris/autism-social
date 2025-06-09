import { DatabaseService } from "./database";
import type { Goal } from "../types";
import { supabase } from "../lib/supabase";

/**
 * Get all available goals
 * @returns Promise with array of goals
 * @throws Error if database query fails
 */
export async function getGoals(): Promise<Goal[]> {
  const result = await DatabaseService.get<Goal>("goals", {
    orderBy: "goal",
    ascending: true,
  });

  if (result.error) {
    throw result.error;
  }

  return result.data || [];
}
/**
 * Update user interests (replace existing with new ones)
 * @param userId - The user ID
 * @param interestIds - Array of interest IDs to set
 * @throws Error if operation fails
 */
export async function updateUserGoals(
  userId: string,
  new_goals: string[]
): Promise<void> {
  const { data, error } = await supabase.rpc("update_user_goals", {
    userId,
    new_goals,
  });
  if (error) throw error;
  return data;
}
