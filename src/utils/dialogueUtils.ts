import type { DialogueScores } from "../services/dialogueCompletion";
import type { ScoreSummary } from "../types";

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export const getDialogueScores = (scores: ScoreSummary): DialogueScores => {
  const dialogueScores: DialogueScores = {};

  for (const [cat, { earned }] of Object.entries(scores)) {
    dialogueScores[cat as keyof DialogueScores] = earned;
  }

  return dialogueScores;
};
