import type { UserRank, RankProgress } from "../types";

// Define the rank thresholds and titles
export const RANKS: UserRank[] = [
  {
    level: 1,
    title: "Beginner",
    minPoints: 0,
    maxPoints: 29,
    icon: "🌱👶",
    color: "#4ade80", // green-400
  },
  {
    level: 2,
    title: "Initiate",
    minPoints: 30,
    maxPoints: 49,
    icon: "🌿",
    color: "#4ade80", // green-400
  },
  {
    level: 2,
    title: "Apprentice",
    minPoints: 50,
    maxPoints: 79,
    icon: "🍀",
    color: "#22c55e", // green-500
  },
  {
    level: 3,
    title: "Practitioner",
    minPoints: 80,
    maxPoints: 119,
    icon: "🌳",
    color: "#16a34a", // green-600
  },
  {
    level: 4,
    title: "Adept",
    minPoints: 120,
    maxPoints: 199,
    icon: "⚡️",
    color: "#54cbe2", // primary color
  },
  {
    level: 5,
    title: "Expert",
    minPoints: 200,
    maxPoints: 399,
    icon: "🌟",
    color: "#3b82f6", // blue-500
  },
  {
    level: 6,
    title: "Master",
    minPoints: 400,
    maxPoints: 599,
    icon: "🔮",
    color: "#8b5cf6", // violet-500
  },
  {
    level: 7,
    title: "Grandmaster",
    minPoints: 600,
    maxPoints: 799,
    icon: "💫",
    color: "#a855f7", // purple-500
  },
  {
    level: 8,
    title: "Sage",
    minPoints: 800,
    maxPoints: 999,
    icon: "🏆",
    color: "#ec4899", // pink-500
  },
  {
    level: 9,
    title: "Virtuoso",
    minPoints: 1000,
    maxPoints: 1499,
    icon: "👑",
    color: "#f59e0b", // amber-500
  },
  {
    level: 10,
    title: "Virtuoso",
    minPoints: 1500,
    maxPoints: Infinity,
    icon: "☄️",
    color: "#c893fb", // secondary color
  },
  {
    level: 10,
    title: "Luminary",
    minPoints: 2000,
    maxPoints: Infinity,
    icon: "✨",
    color: "#c893fb", // secondary color
  },
];

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
