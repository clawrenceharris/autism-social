import { DatabaseService } from "./database";
import type { DailyChallenge } from "../types";

/**
 * Get daily challenges for the current week
 * @returns Promise with array of daily challenges
 * @throws Error if database query fails
 */
export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  // Get the start of the current week (Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekStartString = weekStart.toISOString().split("T")[0];

  const result = await DatabaseService.getWithJoins<DailyChallenge>(
    "daily_challenges",
    `
      *,
      dialogue:dialogues(
        id,
        title,
        difficulty,
        scenario_id,
        scenarios(title)
      )
    `,
    {
      week_start_date: weekStartString,
      is_active: true,
    }
  );

  if (result.error) {
    throw result.error;
  }

  return result.data || [];
}

/**
 * Get daily challenge for a specific day
 * @param dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 * @returns Promise with daily challenge or null if not found
 * @throws Error if database query fails
 */
export async function getDailyChallengeByDay(
  dayOfWeek: number
): Promise<DailyChallenge | null> {
  // Get the start of the current week (Sunday)
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekStartString = weekStart.toISOString().split("T")[0];

  const result = await DatabaseService.getWithJoins<DailyChallenge>(
    "daily_challenges",
    `
      *,
      dialogue:dialogues(
        id,
        title,
        difficulty,
        scenario_id,
        scenarios(title)
      )
    `,
    {
      day_of_week: dayOfWeek,
      week_start_date: weekStartString,
      is_active: true,
    }
  );

  if (result.error) {
    throw result.error;
  }

  return result.data?.[0] || null;
}
