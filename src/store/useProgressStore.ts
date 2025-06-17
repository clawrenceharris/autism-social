import { create } from "zustand";
import { getProgress } from "../services/progress";
import type { ScoreSummary, UserProgress } from "../types";
import { persist } from "zustand/middleware";

interface ProgressStore {
  progress: UserProgress[];
  progressByDialogueId: Record<string, UserProgress[]>;
  categoryScores: ScoreSummary;
  averageScore: number;
  totalPoints: number;
  loading: boolean;
  rankReceived: boolean;
  setRankReceived: (rankReceived: boolean) => void;
  error: string | null;
  calcCategoryScores: () => void;
  calcTotalPoints: () => void;
  fetchProgress: (userId: string) => Promise<void>;
  calcAverageScore: () => void;
  resetProgress: () => void;
}
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: [],
      progressByDialogueId: {},
      rankReceived: false,
      categoryScores: {},
      totalPoints: 0,
      averageScore: 0,
      loading: false,
      error: null,
      calcTotalPoints: () => {
        const categories = [
          "assertiveness",
          "clarity",
          "empathy",
          "social_awareness",
          "self_advocacy",
        ] as const;
        const progress = get().progress;

        let totalPoints = 0;

        for (const entry of progress) {
          for (const category of categories) {
            totalPoints += (entry[category] || 0) * 10;
          }
        }

        set({ totalPoints });
      },
      calcCategoryScores: () => {
        const progress = get().progress;

        const categories = [
          "assertiveness",
          "clarity",
          "empathy",
          "social_awareness",
          "self_advocacy",
        ] as const;

        const categoryScores = categories.reduce<ScoreSummary>(
          (acc, category) => {
            acc[category] = progress.reduce(
              (sum, p) => sum + (p[category] || 0),
              0
            );
            return acc;
          },
          {} as ScoreSummary
        );

        set({ categoryScores });
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

        let totalEarned = 0;
        let totalPossible = 0;

        for (const entry of progress) {
          for (const cat of categories) {
            const value = entry[cat];
            if (value !== null && value !== undefined) {
              totalEarned += value;
              totalPossible += 5; // or use a dynamic max if stored
            }
          }
        }

        if (totalPossible === 0) set({ averageScore: 0 });

        set({ averageScore: Math.round((totalEarned / totalPossible) * 100) });
      },
      fetchProgress: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          const progress = await getProgress(userId);

          set({
            progress,
            progressByDialogueId: progress.reduce<
              Record<string, UserProgress[]>
            >((acc, progress) => {
              if (!acc[progress.dialogue_id]) {
                acc[progress.dialogue_id] = [];
              }
              acc[progress.dialogue_id].push(progress);
              return acc;
            }, {}),
          });
          get().calcAverageScore();
          get().calcTotalPoints();
        } catch {
          set({ error: "Failed to load progress" });
        } finally {
          set({ loading: false });
        }
      },
      setRankReceived: (rankReceived: boolean) => {
        set({ rankReceived });
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
    }),
    {
      name: "scenarios-storage",
      partialize: (state) => ({
        rankReceived: state.rankReceived,
        progress: state.progress,
        categoryScores: state.categoryScores,
        totalPoints: state.totalPoints,
        averageScore: state.averageScore,
      }),
    }
  )
);
