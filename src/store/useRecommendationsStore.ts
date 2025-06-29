// stores/useDialogueStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dialogue } from "../types";
import { getRecommendedDialogues } from "../services/recommendations";

interface RecommendationsStore {
  recommendedDialogues: Dialogue[];
  loading: boolean;
  error: string | null;
  fetchRecommendedDialogues: (userId: string) => void;
}

export const useRecommendationsStore = create<RecommendationsStore>()(
  persist(
    (set) => ({
      recommendedDialogues: [],
      loading: false,
      error: null,

      fetchRecommendedDialogues: async (userId: string) => {
        set({ loading: true, error: null });

        try {
          const recommendedDialogues = await getRecommendedDialogues(userId);
          set({
            recommendedDialogues,
            loading: false,
          });
        } catch {
          set({ error: "Failed to load scenarios", loading: false });
        }
      },
    }),
    {
      name: "recommendations-storage",
      partialize: (state) => ({
        recommendedDialogues: state.recommendedDialogues,
      }),
    }
  )
);
