import { DatabaseService } from "./database";
import type { Interest } from "../types";

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
export async function updateUserInterests(
  userId: string,
  new_interests: string[]
): Promise<string[]> {
  const { data, error } = await DatabaseService.upsert<string[]>(
    "user_interests",
    new_interests,
    userId
  );
  if (error) throw error;
  return data || [];
}
