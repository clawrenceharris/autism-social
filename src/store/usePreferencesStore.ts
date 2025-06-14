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
  fetchGoals: () => void;
  fetchInterests: () => void;
  fetchPreferences: (userId: string) => void;
  setInterests: (userId: string, interests: Interest[]) => void;
  setGoals: (userId: string, goals: Goal[]) => void;
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

  fetchPreferences: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const [interests, goals, userInterests, userGoals] = await Promise.all([
        getInterests(),
        getGoals(),
        getUserInterests(userId),
        getUserGoals(userId),
      ]);
      console.log(userGoals);
      set({
        userInterests,
        userGoals,
        goals,
        interests,
        interestIds: interests.map((i) => i.id),
        goalIds: goals.map((g) => g.id),
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

  setInterests: async (userId: string, newInterests: Interest[]) => {
    try {
      await updateUserInterests(
        userId,
        newInterests.map((i) => i.name)
      );
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

  setGoals: async (userId: string, newGoals: Goal[]) => {
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
