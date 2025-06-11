import type { ScoreSummary } from "./types";
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export const getDialogueScores = (summary: ScoreSummary) => {
  const percentages: Record<string, number> = {};

  for (const [cat, { earned, possible }] of Object.entries(summary)) {
    percentages[cat] = possible > 0 ? Math.round((earned / possible) * 100) : 0;
  }

  return percentages;
};
