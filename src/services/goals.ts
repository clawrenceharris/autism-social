import { DatabaseService } from "./database";
import type { Goal } from "../types";

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
 * Add goals to a user (avoiding duplicates)
 * @param userId - The user ID
 * @param goalIds - Array of goal IDs to add
 * @throws Error if operation fails
 */
export async function addUserGoals(
  userId: string,
  goalIds: string[]
): Promise<void> {
  // Get existing user goals
  const existingResult = await DatabaseService.get<{ goal_id: string }>(
    "user_goals",
    {
      column: "user_id",
      value: userId,
      select: "goal_id",
    }
  );

  if (existingResult.error) {
    throw existingResult.error;
  }

  // Filter out goals that the user already has
  const existingGoalIds = existingResult.data?.map((ug) => ug.goal_id) || [];
  const newGoalIds = goalIds.filter(
    (goalId) => !existingGoalIds.includes(goalId)
  );

  // Only insert if there are new goals to add
  if (newGoalIds.length > 0) {
    const userGoals = newGoalIds.map((goalId) => ({
      user_id: userId,
      goal_id: goalId,
    }));

    const result = await DatabaseService.insertMany("user_goals", userGoals);

    if (result.error) {
      throw result.error;
    }
  }
}

/**
 * Update user goals (replace existing with new ones)
 * @param userId - The user ID
 * @param goalIds - Array of goal IDs to set
 * @throws Error if operation fails
 */
export async function updateUserGoals(
  userId: string,
  goalIds: string[]
): Promise<void> {
  // Get current user goals
  const currentResult = await DatabaseService.get<{ goal_id: string }>(
    "user_goals",
    {
      column: "user_id",
      value: userId,
      select: "goal_id",
    }
  );

  if (currentResult.error) {
    throw currentResult.error;
  }

  const currentGoalIds = currentResult.data?.map((ug) => ug.goal_id) || [];

  // Find goals to add and remove
  const goalsToAdd = goalIds.filter(
    (goalId) => !currentGoalIds.includes(goalId)
  );
  const goalsToRemove = currentGoalIds.filter(
    (goalId) => !goalIds.includes(goalId)
  );

  // Remove unselected goals
  if (goalsToRemove.length > 0) {
    const deleteResult = await DatabaseService.deleteIn(
      "user_goals",
      "goal_id",
      goalsToRemove.filter((goalId) => 
        currentResult.data?.some(ug => ug.goal_id === goalId)
      )
    );

    if (deleteResult.error) {
      throw deleteResult.error;
    }
  }

  // Add new goals
  if (goalsToAdd.length > 0) {
    const userGoals = goalsToAdd.map((goalId) => ({
      user_id: userId,
      goal_id: goalId,
    }));

    const insertResult = await DatabaseService.insertMany("user_goals", userGoals);

    if (insertResult.error) {
      throw insertResult.error;
    }
  }
}