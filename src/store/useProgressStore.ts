import { create } from "zustand";
import { getProgress } from "../services/progress";
import type { ScoreSummary, UserProgress } from "../types";
import { persist } from "zustand/middleware";

interface ProgressStore {
  progress: UserProgress[];
  progressByDialogueId: Record<string, UserProgress[]>;
  categoryScores: ScoreSummary;
  totalPoints: number;
  loading: boolean;
  rankReceived: boolean;
  setRankReceived: (rankReceived: boolean) => void;
  error: string | null;
  calcCategoryScores: () => void;
  calcTotalPoints: () => void;
  fetchProgress: (userId: string) => Promise<void>;
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
          get().calcTotalPoints();
          get().calcCategoryScores();
        } catch (error) {
          console.error("Failed to load progress:", error);
          set({ error: "Failed to load progress", loading: false });
        }
      },
      
      setRankReceived: (rankReceived: boolean) => {
        set({ rankReceived });
      },
      
      resetProgress: () => {
        set({ 
          progress: [],
          progressByDialogueId: {},
          categoryScores: {},
          totalPoints: 0
        });
      },
    }),
    {
      name: "progress-storage",
      partialize: (state) => ({
        rankReceived: state.rankReceived,
        progress: state.progress,
        categoryScores: state.categoryScores,
        totalPoints: state.totalPoints,
      }),
    }
  )
);