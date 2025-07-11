import { create } from "zustand";

import { getGoals } from "../services/goals";
import type { Goal, Interest } from "../types";
import {
  getInterests,
  getUserGoals,
  getUserInterests,
  updateUserGoals,
  updateUserInterests,
} from "../services/preferences";

interface PreferencesStore {
  userGoals: Goal[];
  userGoalIds: string[];

  userInterests: Interest[];
  userInterestIds: string[];

  interests: Interest[];
  interestIds: string[];

  goals: Goal[];
  goalIds: string[];

  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchInterests: () => Promise<void>;
  fetchUserPreferences: (userId: string) => Promise<void>;

  setUserInterests: (userId: string, interests: Interest[]) => void;
  setUserGoals: (userId: string, goals: Goal[]) => void;
  clearUserGoals: () => void;
  clearUserInterests: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  interests: [],
  interestIds: [],

  goals: [],
  goalIds: [],
  userGoals: [],
  userGoalIds: [],
  userInterests: [],
  userInterestIds: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    try {
      set({ loading: true, error: null });

      const goals = await getGoals();

      set({
        goals,

        goalIds: goals.map((g) => g.id),
      });
    } catch (err) {
      console.error("Error fetching goals:", err);
      set({ error: "Could not load selections" });
    } finally {
      set({ loading: false });
    }
  },
  fetchInterests: async () => {
    try {
      set({ loading: true, error: null });

      const interests = await getInterests();

      set({
        interests,

        interestIds: interests.map((g) => g.id),
      });
    } catch (err) {
      console.error("Error fetching interests:", err);
      set({ error: "Could not load selections" });
    } finally {
      set({ loading: false });
    }
  },
  fetchUserPreferences: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const [userInterests, userGoals] = await Promise.all([
        getUserInterests(userId),
        getUserGoals(userId),
      ]);
      set({
        userInterests,
        userGoals,

        userInterestIds: userInterests.map((i) => i.id),
        userGoalIds: userGoals.map((g) => g.id),
      });
    } catch (err) {
      console.error("Error fetching preferences:", err);
      set({ error: "Could not load preferences" });
    } finally {
      set({ loading: false });
    }
  },
  setUserInterests: async (userId: string, newInterests: Interest[]) => {
    try {
      const updatedInterests = await updateUserInterests(
        userId,
        newInterests.map((i) => i.id)
      );
      set({
        userInterests: updatedInterests,
        userInterestIds: updatedInterests.map((i) => i.id),
      });
    } catch (err) {
      console.error("Error updating interests:", err);
      set({ error: "Could not update interests" });
    }
  },

  setUserGoals: async (userId: string, newGoals: Goal[]) => {
    try {
      await updateUserGoals(
        userId,
        newGoals.map((g) => g.goal)
      );
      set({ userGoals: newGoals });
    } catch (err) {
      console.error("Error updating goals:", err);
      set({ error: "Could not update goals" });
    }
  },

  clearUserGoals: () => set({ goals: [], error: null }),
  clearUserInterests: () => set({ interests: [], error: null }),
}));
