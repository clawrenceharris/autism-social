import type { UserProfile } from "../types";
import { DatabaseService } from "./database";

export interface CreateUserProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  age?: number | null;
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
