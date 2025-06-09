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
