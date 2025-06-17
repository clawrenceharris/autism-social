import { create } from "zustand";
import { getProgress } from "../services/progress";
import type { ScoreSummary, UserProgress } from "../types";

interface ProgressStore {
  progress: UserProgress[] | null;
  progressByDialogueId: Record<string, UserProgress[]>;
  scores: ScoreSummary;
  loading: boolean;
  error: string | null;
  setScores: () => void;
  fetchProgress: (userId: string) => Promise<void>;

  updateProgressValue: (category: keyof UserProgress, delta: number) => void;
  calcAverageScore: (progress: UserProgress[]) => number;
  resetProgress: () => void;
}
export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: null,
  progressByDialogueId: {},
  scores: {
    assertiveness: 0,
    clarity: 0,
    empathy: 0,
    social_awareness: 0,
    self_advocacy: 0,
  },
  loading: false,
  error: null,

  setScores: () => {
    const progress = get().progress;
    if (!progress) return;
  },

  calcAverageScore: (): number => {
    const progress = get().progress;
    if (!progress) {
      return 0;
    }
    const total = progress.length;
    const sum = progress.reduce<number>(
      (acc, p) =>
        acc +
        p.assertiveness +
        p.clarity +
        p.empathy +
        p.social_awareness +
        p.self_advocacy,
      0
    );
    return sum / total;
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
