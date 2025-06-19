import { create } from "zustand";
import { getProgress } from "../services/progress";
import type { ScoreCategory, ScoreSummary, UserProgress } from "../types";
import { persist } from "zustand/middleware";

interface ProgressStore {
  progress: UserProgress[];
  progressByDialogueId: Record<string, UserProgress[]>;
  categoryScores: ScoreSummary;
  averageCategoryScores: ScoreSummary;
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
  calcAverageCategoryScore: () => void;

  resetProgress: () => void;
}
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: [],
      averageCategoryScores: {},
      progressByDialogueId: {},
      rankReceived: false,
      categoryScores: {},
      totalPoints: 0,
      averageScore: 0,
      loading: false,
      error: null,
      calcAverageCategoryScore: () => {
        const progress = get().progress;

        const categories = [
          "assertiveness",
          "clarity",
          "empathy",
          "social_awareness",
          "self_advocacy",
        ] as const;

        const totalEarned: Record<ScoreCategory, number> = {
          clarity: 0,
          empathy: 0,
          assertiveness: 0,
          self_advocacy: 0,
          social_awareness: 0,
        };
        const totalPossible: Record<ScoreCategory, number> = {
          clarity: 0,
          empathy: 0,
          assertiveness: 0,
          self_advocacy: 0,
          social_awareness: 0,
        };
        for (const entry of progress) {
          for (const cat of categories) {
            const earned = entry.scoring[cat];
            const possible = entry.max_scoring[cat];

            if (earned && possible) {
              totalPossible[cat] += possible;

              totalEarned[cat] += earned;
            }
          }
        }

        const averageCategoryScores = Object.fromEntries(
          Object.keys(totalEarned).map((cat) => [
            cat,

            Math.round(
              ((totalEarned[cat as ScoreCategory] || 0) /
                (totalPossible[cat as ScoreCategory] || 1)) *
                100
            ),
          ])
        );
        set({ averageCategoryScores });
      },
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
            totalPoints += entry.scoring[category] || 0;
          }
        }
        if (totalPoints != get().totalPoints) {
          set({ rankReceived: false });
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
              (sum, p) => sum + (p.scoring[category] || 0),
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
            const earned = entry.scoring[cat];
            const possible = entry.max_scoring[cat]; //total possible score that can be given for this category

            if (earned && possible) {
              totalEarned += earned;
              totalPossible += possible;
              console.log({ earned, possible });
            }
          }
        }
        const averageScore =
          totalPossible !== 0
            ? Math.round((totalEarned / totalPossible) * 100)
            : 0;

        set({
          averageScore,
        });
      },
      fetchProgress: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          const progress = await getProgress(userId);

          set({
            progress,
            loading: false,
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
          get().calcAverageCategoryScore();
        } catch {
          set({ error: "Failed to load progress", loading: false });
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
      name: "progress-storage",
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
