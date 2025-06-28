import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDailyChallenges } from "../services/dailyChallenges";
import type { Dialogue } from "../types";

export interface DailyChallenge {
  id: string;
  day_of_week: number;
  dialogue_id: string;
  week_start_date: string;
  is_active: boolean;
  created_at?: string;
  dialogue?: Dialogue;
}

interface DailyChallengeStore {
  challenges: DailyChallenge[];
  loading: boolean;
  error: string | null;
  fetchDailyChallenges: () => Promise<void>;
  getDayChallenge: (dayOfWeek: number) => DailyChallenge | null;
  clearChallenges: () => void;
}

export const useDailyChallengeStore = create<DailyChallengeStore>()(
  persist(
    (set, get) => ({
      challenges: [],
      loading: false,
      error: null,

      fetchDailyChallenges: async () => {
        set({ loading: true, error: null });
        try {
          const challenges = await getDailyChallenges();
          set({ challenges, loading: false });
        } catch (error) {
          console.error("Failed to fetch daily challenges:", error);
          set({
            error: "Failed to load daily challenges",
            loading: false,
          });
        }
      },

      getDayChallenge: (dayOfWeek: number) => {
        const challenges = get().challenges;
        return challenges.find((c) => c.day_of_week === dayOfWeek) || null;
      },

      clearChallenges: () => set({ challenges: [], error: null }),
    }),
    {
      name: "daily-challenges-storage",
      partialize: (state) => ({
        challenges: state.challenges,
      }),
    }
  )
);
