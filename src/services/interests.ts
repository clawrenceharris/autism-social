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
 * Add interests to a user (avoiding duplicates)
 * @param userId - The user ID
 * @param interestIds - Array of interest IDs to add
 * @throws Error if operation fails
 */
export async function addUserInterests(
  userId: string,
  interestIds: string[]
): Promise<void> {
  // Get existing user interests
  const existingResult = await DatabaseService.get<{ interest_id: string }>(
    "user_interests",
    {
      column: "user_id",
      value: userId,
      select: "interest_id",
    }
  );

  if (existingResult.error) {
    throw existingResult.error;
  }

  // Filter out interests that the user already has
  const existingInterestIds = existingResult.data?.map((ui) => ui.interest_id) || [];
  const newInterestIds = interestIds.filter(
    (interestId) => !existingInterestIds.includes(interestId)
  );

  // Only insert if there are new interests to add
  if (newInterestIds.length > 0) {
    const userInterests = newInterestIds.map((interestId) => ({
      user_id: userId,
      interest_id: interestId,
    }));

    const result = await DatabaseService.insertMany("user_interests", userInterests);

    if (result.error) {
      throw result.error;
    }
  }
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
): Promise<void> {
  // Get current user interests
  const currentResult = await DatabaseService.get<{ interest_id: string }>(
    "user_interests",
    {
      column: "user_id",
      value: userId,
      select: "interest_id",
    }
  );

  if (currentResult.error) {
    throw currentResult.error;
  }

  const currentInterestIds = currentResult.data?.map((ui) => ui.interest_id) || [];

  // Find interests to add and remove
  const interestsToAdd = interestIds.filter(
    (interestId) => !currentInterestIds.includes(interestId)
  );
  const interestsToRemove = currentInterestIds.filter(
    (interestId) => !interestIds.includes(interestId)
  );

  // Remove unselected interests
  if (interestsToRemove.length > 0) {
    // We need to delete by user_id and interest_id combination
    for (const interestId of interestsToRemove) {
      const deleteResult = await DatabaseService.deleteBy(
        "user_interests",
        "user_id",
        userId
      );
      
      if (deleteResult.error) {
        throw deleteResult.error;
      }
    }
  }

  // Add new interests
  if (interestsToAdd.length > 0) {
    const userInterests = interestsToAdd.map((interestId) => ({
      user_id: userId,
      interest_id: interestId,
    }));

    const insertResult = await DatabaseService.insertMany("user_interests", userInterests);

    if (insertResult.error) {
      throw insertResult.error;
    }
  }
}