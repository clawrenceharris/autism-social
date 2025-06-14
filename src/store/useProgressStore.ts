import { create } from "zustand";
import {
  createProgress,
  getProgress,
  updateProgress,
  calculateProgressPercentages,
} from "../services/progress";
import type { UserProgress } from "../types";

interface ProgressStore {
  progress: UserProgress | null;
  progressPercentages: {
    clarity: number;
    empathy: number;
    assertiveness: number;
    social_awareness: number;
    self_advocacy: number;
  } | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string) => Promise<void>;
  updateProgressValue: (category: keyof UserProgress, delta: number) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: null,
  progressPercentages: null,
  loading: false,
  error: null,

  fetchProgress: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      let progress = await getProgress(userId);

      if (!progress) {
        progress = await createProgress(userId);
      }

      const progressPercentages = calculateProgressPercentages(progress);

      set({ progress, progressPercentages });
    } catch (error) {
      console.error("Progress fetch failed:", error);
      set({ error: "Failed to load progress" });
    } finally {
      set({ loading: false });
    }
  },

  updateProgressValue: (category, delta) => {
    const current = get().progress;
    if (!current) return;

    const updated = {
      ...current,
      [category]: (current[category] as number) + delta,
    };

    // Recalculate percentages
    const progressPercentages = calculateProgressPercentages(updated);

    // optimistic update
    set({ progress: updated, progressPercentages });

    // optional: persist to DB
    updateProgress(updated.user_id, updated).catch((err) => {
      console.error("Failed to persist progress", err);
    });
  },

  resetProgress: () => {
    const current = get().progress;
    if (!current) return;

    const reset = {
      ...current,
      clarity_earned: 0,
      clarity_possible: 0,
      empathy_earned: 0,
      empathy_possible: 0,
      assertiveness_earned: 0,
      assertiveness_possible: 0,
      social_awareness_earned: 0,
      social_awareness_possible: 0,
      self_advocacy_earned: 0,
      self_advocacy_possible: 0,
    };

    const progressPercentages = calculateProgressPercentages(reset);

    set({ progress: reset, progressPercentages });

    updateProgress(reset.user_id, reset).catch((err) =>
      console.error("Failed to reset progress", err)
    );
  },
}));