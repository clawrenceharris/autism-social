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
  const userGoals = goalIds.map((goalId) => ({
    user_id: userId,
    goal_id: goalId,
  }));

  const { error } = await supabase.from("user_goals").insert(userGoals);

  if (error) throw error;
}
