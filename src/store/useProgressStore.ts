import { create } from "zustand";
import { getProgress } from "../services/progress";
import type { ScoreSummary, UserProgress } from "../types";

interface ProgressStore {
  progress: UserProgress[];
  progressByDialogueId: Record<string, UserProgress[]>;
  scores: ScoreSummary;
  loading: boolean;
  error: string | null;

  getTotalScore: () => number;
  fetchProgress: (userId: string) => Promise<void>;
  updateProgressValue: (category: keyof UserProgress, delta: number) => void;
  calcAverageScore: () => number;
  resetProgress: () => void;
}
export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: [],
  progressByDialogueId: {},
  scores: {},
  loading: false,
  error: null,
  getTotalScore: () => {
    const categories = [
      "assertiveness",
      "clarity",
      "empathy",
      "social_awareness",
      "self_advocacy",
    ] as const;
    const progress = get().progress;

    let score = 0;

    for (const entry of progress) {
      for (const category of categories) {
        score += entry[category] || 0;
      }
    }

    return score;
  },

  calcAverageScore: () => {
    const progress = get().progress;
    if (!progress) {
      return 0;
    }
    const categories = [
      "assertiveness",
      "clarity",
      "empathy",
      "social_awareness",
      "self_advocacy",
    ] as const;

    const totalDialogues = progress.length;
    const totalCategories = categories.length;

    let totalNormalizedScore = 0;

    for (const entry of progress) {
      for (const category of categories) {
        const rawScore = entry[category] || 0;
        totalNormalizedScore += rawScore / 5; // assuming 5 is the max score per category per dialogue
      }
    }

    const maxPossibleScore = totalDialogues * totalCategories;
    const averageScorePercent = (totalNormalizedScore / maxPossibleScore) * 100;
    return averageScorePercent;
  },
  fetchProgress: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const progress = await getProgress(userId);

      set({
        progress,
        progressByDialogueId: progress.reduce<Record<string, UserProgress[]>>(
          (acc, progress) => {
            if (!acc[progress.dialogue_id]) {
              acc[progress.dialogue_id] = [];
            }
            acc[progress.dialogue_id].push(progress);
            return acc;
          },
          {}
        ),
      });
    } catch (error) {
      console.error("Progress fetch failed:", error);
      set({ error: "Failed to load progress" });
    } finally {
      set({ loading: false });
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateProgressValue: (_category, _delta) => {
    // const current = get().progress;
    // if (!current) return;
    // const updated = {
    //   ...current,
    //   [category]: (current[category] as number) + delta,
    // };
    // // optimistic update
    // set({ progress: updated });
    // // optional: persist to DB
    // updateProgress(updated.user_id, updated).catch((err) => {
    //   console.error("Failed to persist progress", err);
    // });
  },

  resetProgress: () => {
    const current = get().progress;
    if (!current) return;

    const reset = {
      ...current,
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      social_awareness: 0,
      self_advocacy: 0,
    };

    set({ progress: reset });
  },
}));
