import { create } from "zustand";
import { getInterests, updateUserInterests } from "../services/interests";
import {
  getUserGoals,
  getUserInterests,
  updateUserGoals,
} from "../services/user";
import { getGoals } from "../services/goals";
import type { Goal, Interest } from "../types";

interface PreferencesStore {
  userGoals: string[];
  userInterests: string[];
  interests: Interest[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => void;
  fetchInterests: () => void;
  fetchPreferences: (userId: string) => void;
  setInterests: (userId: string, interests: string[]) => void;
  setGoals: (userId: string, goals: string[]) => void;
  clearUserGoals: () => void;
  clearUserInterests: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  interests: [],
  goals: [],
  userGoals: [],
  userInterests: [],
  loading: false,
  error: null,

  fetchPreferences: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const [interests, goals] = await Promise.all([
        getUserInterests(userId),
        getUserGoals(userId),
      ]);

      set({
        userInterests: interests.map((i) => i.name),
        userGoals: goals.map((g) => g.goal),
      });
    } catch (err) {
      console.error("Error fetching preferences:", err);
      set({ error: "Could not load preferences" });
    } finally {
      set({ loading: false });
    }
  },

  setInterests: async (userId, newInterests) => {
    try {
      await updateUserInterests(userId, newInterests);
      set({ userInterests: newInterests });
    } catch (err) {
      console.error("Error updating interests:", err);
      set({ error: "Could not update interests" });
    }
  },
  fetchGoals: async () => {
    try {
      const goals = await getGoals();
      set({ goals });
    } catch (err) {
      console.error("Error loading goals:", err);
      set({ error: "Could not load goals" });
    }
  },
  fetchInterests: async () => {
    try {
      const interests = await getInterests();
      set({ interests });
    } catch (err) {
      console.error("Error loading interests:", err);
      set({ error: "Could not load interests" });
    }
  },

  setGoals: async (userId, newGoals) => {
    try {
      await updateUserGoals(userId, newGoals);
      set({ userGoals: newGoals });
    } catch (err) {
      console.error("Error updating goals:", err);
      set({ error: "Could not update goals" });
    }
  },

  clearUserGoals: () => set({ goals: [], error: null }),
  clearUserInterests: () => set({ interests: [], error: null }),
}));
