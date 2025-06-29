import { supabase } from "../lib/supabase";
import type { Goal, Interest } from "../types";
import { DatabaseService } from "./database";

/**
 * Get all available interests
 * @returns Promise with array of interests
 * @throws Error if database query fails
 */
export async function getInterests(): Promise<Interest[]> {
  const result = await DatabaseService.get<Interest>("interests", {
    orderBy: "name",
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
  goalIds: string[]
): Promise<void> {
  const { data, error } = await supabase.rpc("update_user_goals", {
    user_uuid: userId,
    new_goal_ids: goalIds,
  });
  console.log({ data });
  if (error) {
    console.log({ error });

    throw error;
  }
  return data;
}

/**
 * Update user interests (replace existing with new ones)
 * @param userId - The user ID
 * @param interestIds - Array of interest IDs to set
 * @throws Error if operation fails
 */
export async function updateUserInterests(
  userId: string,
  interestIds: string[]
): Promise<Interest[]> {
  const { data, error } = await supabase.rpc("update_user_interests", {
    user_uuid: userId,
    new_interest_ids: interestIds,
  });

  if (error) {
    console.log({ error });
    throw error;
  }
  return data;
}

/**
 * Get all user goals
 * @returns Promise with array of the user's goals
 * @throws Error if database query fails
 */
export async function getUserGoals(userId: string): Promise<Goal[]> {
  const result = await DatabaseService.get<{ goals: Goal }>("user_goals", {
    select: "goals(*)",
    foreignKey: "user_id",
    foreignValue: userId,
  });

  if (result.error) {
    throw result.error;
  }
  const goals: Goal[] = result.data?.map((row) => row.goals) || [];
  return goals;
}

/**
 * Get all user interests
 * @returns Promise with array of the user's interests
 * @throws Error if database query fails
 */
export async function getUserInterests(userId: string): Promise<Interest[]> {
  const result = await DatabaseService.get<{ interests: Interest }>(
    "user_interests",
    {
      select: "interests(*)",
      foreignKey: "user_id",
      foreignValue: userId,
    }
  );

  if (result.error) {
    throw result.error;
  }
  const interests: Interest[] = result.data?.map((row) => row.interests) || [];

  return interests;
}
