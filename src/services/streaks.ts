import { DatabaseService } from "./database";
import { supabase } from "../lib/supabase";

// Streak tracking types
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completion_date: string | null; // ISO date string (YYYY-MM-DD)
  last_completion_timezone: string;
  created_at: string;
  updated_at: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // ISO date string (YYYY-MM-DD)
  lastCompletionTimezone: string;
}

export interface StreakUpdateResult {
  success: boolean;
  streakData: StreakData;
  streakIncremented: boolean;
  streakReset: boolean;
  message?: string;
}
/**
 * Get user streak data by user ID
 * @param userId - The user ID to get streak data for
 * @returns Promise with user streak data or null if not found
 * @throws Error if database error occurs
 */
export async function getUserStreak(
  userId: string
): Promise<StreakData | null> {
  const result = await DatabaseService.getSingleBy<UserStreak>(
    "user_streaks",
    "user_id",
    userId
  );

  if (result.error) {
    throw result.error;
  }

  if (!result.data) {
    return null;
  }

  return {
    currentStreak: result.data.current_streak,
    longestStreak: result.data.longest_streak,
    lastCompletionDate: result.data.last_completion_date,
    lastCompletionTimezone: result.data.last_completion_timezone,
  };
}

/**
 * Create or update user streak data
 * @param userId - The user ID
 * @param streakData - The streak data to save
 * @returns Promise with updated streak data
 * @throws Error if operation fails
 */
export async function upsertUserStreak(
  userId: string,
  streakData: StreakData
): Promise<StreakData> {
  const { data, error } = await supabase.rpc("upsert_user_streak", {
    p_user_id: userId,
    p_current_streak: streakData.currentStreak + 1,
    p_longest_streak: streakData.longestStreak,
    p_last_completion_date: streakData.lastCompletionDate,
    p_timezone: streakData.lastCompletionTimezone,
  });

  if (error) {
    throw error;
  }

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastCompletionDate: data.last_completion_date,
    lastCompletionTimezone: data.last_completion_timezone,
  };
}

/**
 * Reset user streak to 0
 * @param userId - The user ID
 * @returns Promise with reset streak data
 * @throws Error if operation fails
 */
export async function resetUserStreak(userId: string): Promise<StreakData> {
  const currentData = await getUserStreak(userId);

  const resetData: StreakData = {
    currentStreak: 0,
    longestStreak: currentData?.longestStreak || 0,
    lastCompletionDate: null,
    lastCompletionTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return await upsertUserStreak(userId, resetData);
}

/**
 * Utility function to get current date in user's timezone
 * @param timezone - The timezone string (e.g., 'America/New_York')
 * @returns Date string in YYYY-MM-DD format
 */
export function getCurrentDateInTimezone(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Check if two dates are consecutive days
 * @param date1 - First date (YYYY-MM-DD)
 * @param date2 - Second date (YYYY-MM-DD)
 * @returns True if date2 is the day after date1
 */
export function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + "T00:00:00");
  const d2 = new Date(date2 + "T00:00:00");

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return Math.abs(diffDays) === 1 && diffDays > 0;
}

/**
 * Check if a date is today in the given timezone
 * @param date - Date string (YYYY-MM-DD)
 * @param timezone - Timezone string
 * @returns True if the date is today
 */
export function isToday(date: string, timezone: string): boolean {
  const today = getCurrentDateInTimezone(timezone);
  return date === today;
}

/**
 * Calculate days between two dates
 * @param date1 - Earlier date (YYYY-MM-DD)
 * @param date2 - Later date (YYYY-MM-DD)
 * @returns Number of days between dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + "T00:00:00");
  const d2 = new Date(date2 + "T00:00:00");

  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
