import { supabase } from "../lib/supabase";
import type { Goal } from "../types";

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("id, goal");

  if (error) throw error;
  return data || [];
}

export async function addUserGoals(
  userId: string,
  goalIds: string[]
): Promise<void> {
  // First, get the user's existing goals to avoid duplicates
  const { data: existingGoals, error: fetchError } = await supabase
    .from("user_goals")
    .select("goal_id")
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  // Filter out goals that the user already has
  const existingGoalIds = existingGoals?.map(ug => ug.goal_id) || [];
  const newGoalIds = goalIds.filter(goalId => !existingGoalIds.includes(goalId));

  // Only insert if there are new goals to add
  if (newGoalIds.length > 0) {
    const userGoals = newGoalIds.map((goalId) => ({
      user_id: userId,
      goal_id: goalId,
    }));

    const { error } = await supabase.from("user_goals").insert(userGoals);

    if (error) throw error;
  }
}

export async function updateUserGoals(
  userId: string,
  goalIds: string[]
): Promise<void> {
  // Get current user goals
  const { data: currentGoals, error: fetchError } = await supabase
    .from("user_goals")
    .select("goal_id")
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  const currentGoalIds = currentGoals?.map(ug => ug.goal_id) || [];
  
  // Find goals to add and remove
  const goalsToAdd = goalIds.filter(goalId => !currentGoalIds.includes(goalId));
  const goalsToRemove = currentGoalIds.filter(goalId => !goalIds.includes(goalId));

  // Remove unselected goals
  if (goalsToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_goals")
      .delete()
      .eq("user_id", userId)
      .in("goal_id", goalsToRemove);

    if (deleteError) throw deleteError;
  }

  // Add new goals
  if (goalsToAdd.length > 0) {
    const userGoals = goalsToAdd.map((goalId) => ({
      user_id: userId,
      goal_id: goalId,
    }));

    const { error: insertError } = await supabase
      .from("user_goals")
      .insert(userGoals);

    if (insertError) throw insertError;
  }
}