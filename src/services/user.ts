import { supabase } from "../lib/supabase";
import type { Goal, Interest, UserProfile } from "../types";
import { DatabaseService } from "./database";

export interface CreateUserProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
}

/**
 * Create a new user profile
 * @param data - User profile data to create
 * @returns Promise with created user profile
 * @throws Error if creation fails
 */
export async function createUserProfile(
  data: CreateUserProfileData
): Promise<UserProfile> {
  const result = await DatabaseService.create<UserProfile>(
    "user_profiles",
    data as UserProfile
  );

  if (result.error || !result.data) {
    throw result.error || new Error("Failed to create user profile");
  }

  return result.data;
}

/**
 * Get user profile by user ID
 * @param userId - The user ID to get profile for
 * @returns Promise with user profile or null if not found
 * @throws Error if database query fails
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const result = await DatabaseService.getSingleBy<UserProfile>(
    "user_profiles",
    "user_id",
    userId
  );

  if (result.error) {
    throw result.error;
  }

  return result.data;
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

/**
 * Update user profile
 * @param userId - The user ID to update
 * @param updates - Partial user profile data to update
 * @returns Promise with updated user profile
 * @throws Error if update fails
 */
export async function updateUserProfile(
  userId: string,
  updates: UpdateUserProfileData
): Promise<UserProfile> {
  const result = await DatabaseService.updateBy<UserProfile>(
    "user_profiles",
    "user_id",
    userId,
    updates
  );

  if (result.error || !result.data) {
    throw result.error || new Error("Failed to update user profile");
  }

  return result.data;
}

/**
 * Delete user profile
 * @param userId - The user ID to delete profile for
 * @throws Error if deletion fails
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  const result = await DatabaseService.deleteBy(
    "user_profiles",
    "user_id",
    userId
  );

  if (result.error) {
    throw result.error;
  }
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
    user_uuid: userId,
    new_goals,
  });
  if (error) throw error;
  return data;
}
