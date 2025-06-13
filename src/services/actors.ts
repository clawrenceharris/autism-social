import type { Actor } from "../types";
import { DatabaseService } from "./database";

/**
 * Get all Dialogue Actors
 * @returns Promise with array of goals
 * @throws Error if database query fails
 */
export async function getActors(): Promise<Actor[]> {
  const result = await DatabaseService.get<Actor>("actors");
  if (result.error) {
    throw result.error;
  }

  return result.data || [];
}
