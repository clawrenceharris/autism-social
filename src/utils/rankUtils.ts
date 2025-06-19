import { RANKS } from "../constants/ranks";
import type { UserRank, RankProgress } from "../types";

// Define the rank thresholds and titles

/**
 * Get the user's current rank based on their total points
 * @param points - The user's total points
 * @returns The user's current rank
 */
export function getCurrentRank(points: number): UserRank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      return RANKS[i];
    }
  }
  return RANKS[0]; // Default to beginner if something goes wrong
}

/**
 * Get the next rank based on the current rank
 * @param currentRank - The user's current rank
 * @returns The next rank or null if at max rank
 */
export function getNextRank(currentRank: UserRank): UserRank | null {
  const nextRankIndex =
    RANKS.findIndex((rank) => rank.level === currentRank.level) + 1;
  return nextRankIndex < RANKS.length ? RANKS[nextRankIndex] : null;
}

/**
 * Calculate the user's rank progress
 * @param totalPoints - The user's total points
 * @returns Detailed rank progress information
 */
export function calculateRankProgress(totalPoints: number): RankProgress {
  const currentRank = getCurrentRank(totalPoints);
  const nextRank = getNextRank(currentRank);

  // Calculate points within current rank
  const pointsInCurrentRank = totalPoints - currentRank.minPoints;

  // Calculate points needed for next rank and percentage
  let pointsForNextRank = 0;
  let percentToNextRank = 100; // Default to 100% if at max rank
  let remainingPoints = 0;

  if (nextRank) {
    pointsForNextRank = nextRank.minPoints - currentRank.minPoints;
    percentToNextRank = Math.min(
      100,
      Math.round((pointsInCurrentRank / pointsForNextRank) * 100)
    );
    remainingPoints = nextRank.minPoints - totalPoints;
  }

  return {
    currentRank,
    nextRank,
    currentPoints: totalPoints,
    pointsForNextRank,
    pointsInCurrentRank,
    percentToNextRank,
    remainingPoints,
  };
}

/**
 * Check if the user has ranked up based on previous and current points
 * @param previousPoints - The user's previous total points
 * @param currentPoints - The user's current total points
 * @returns Whether the user has ranked up
 */
export function hasRankedUp(
  previousPoints: number,
  currentPoints: number
): boolean {
  const previousRank = getCurrentRank(previousPoints);
  const currentRank = getCurrentRank(currentPoints);
  return currentRank.level > previousRank.level;
}
