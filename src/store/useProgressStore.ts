import { create } from "zustand";
import {
  createProgress,
  getProgress,
  updateProgress,
} from "../services/progress";
import type { UserProgress } from "../types";

interface ProgressStore {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string) => Promise<void>;
  updateProgressValue: (category: keyof UserProgress, delta: number) => void;
  calcAverageScore: () => void;
  resetProgress: () => void;
}
export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: null,
  loading: false,
  error: null,
  calcAverageScore: () => {},
  fetchProgress: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      let progress = await getProgress(userId);

      if (!progress) {
        progress = await createProgress(userId);
      }

      set({ progress });
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

    // optimistic update
    set({ progress: updated });

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
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      social_awareness: 0,
      self_advocacy: 0,
    };

    set({ progress: reset });

    updateProgress(reset.user_id, reset).catch((err) =>
      console.error("Failed to reset progress", err)
    );
  },
}));
