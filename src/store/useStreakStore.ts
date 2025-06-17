import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StreakData, StreakUpdateResult } from "../types";
import {
  upsertUserStreak,
  resetUserStreak,
  getCurrentDateInTimezone,
  areConsecutiveDays,
  isToday,
  daysBetween,
} from "../services/streaks";

interface StreakStore {
  // State
  streakData: StreakData | null;
  loading: boolean;
  error: string | null;
  lastSyncTime: number | null;

  // Actions
  fetchStreak: (userId: string) => Promise<void>;
  incrementStreak: (userId: string) => Promise<StreakUpdateResult>;
  resetStreak: (userId: string) => Promise<void>;
  getStreak: () => number;
  checkAndUpdateStreak: (userId: string) => Promise<StreakUpdateResult>;
  clearError: () => void;

  // Internal helpers
  _updateLocalStreak: (data: StreakData) => void;
  _shouldSync: () => boolean;
}

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      // Initial state
      streakData: null,
      loading: false,
      error: null,
      lastSyncTime: null,

      // Fetch streak data from server
      fetchStreak: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          // Initialize streak data for new user
          const initialData: StreakData = {
            currentStreak: 0,
            longestStreak: 0,
            lastCompletionDate: null,
            lastCompletionTimezone:
              Intl.DateTimeFormat().resolvedOptions().timeZone,
          };

          const createdData = await upsertUserStreak(userId, initialData);
          set({
            streakData: createdData,
            lastSyncTime: Date.now(),
            loading: false,
          });
        } catch (err) {
          console.error("Error fetching streak:", err);
          set({
            error:
              err instanceof Error ? err.message : "Failed to load streak data",
            loading: false,
          });
        }
      },

      // Increment streak if conditions are met
      incrementStreak: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          // Get current streak data
          const currentData = get().streakData;

          if (!currentData) {
            await get().fetchStreak(userId);
            return get().incrementStreak(userId);
          }

          // Get current date in user's timezone
          const timezone =
            currentData.lastCompletionTimezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const today = getCurrentDateInTimezone(timezone);

          // If already completed today, don't increment
          if (
            currentData.lastCompletionDate &&
            isToday(currentData.lastCompletionDate, timezone)
          ) {
            set({ loading: false });
            return {
              success: true,
              streakData: currentData,
              streakIncremented: false,
              streakReset: false,
              message: "Already completed today",
            };
          }

          let newStreak = currentData.currentStreak;
          let streakReset = false;
          let streakIncremented = false;

          // Check if this is a consecutive day
          if (currentData.lastCompletionDate) {
            if (areConsecutiveDays(currentData.lastCompletionDate, today)) {
              // Consecutive day - increment streak
              newStreak += 1;
              streakIncremented = true;
            } else if (daysBetween(currentData.lastCompletionDate, today) > 1) {
              // Missed a day - reset streak
              newStreak = 1; // Start new streak
              streakReset = true;
            } else {
              // Same day - no change
              newStreak = currentData.currentStreak;
            }
          } else {
            // First completion ever
            newStreak = 1;
            streakIncremented = true;
          }

          // Update streak data
          const updatedData: StreakData = {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, currentData.longestStreak || 0),
            lastCompletionDate: today,
            lastCompletionTimezone: timezone,
          };

          // Save to database
          const savedData = await upsertUserStreak(userId, updatedData);

          // Update local state
          set({
            streakData: savedData,
            lastSyncTime: Date.now(),
            loading: false,
          });

          return {
            success: true,
            streakData: savedData,
            streakIncremented,
            streakReset,
            message: streakIncremented
              ? "Streak increased!"
              : streakReset
              ? "Streak reset and started new streak"
              : "Streak maintained",
          };
        } catch (err) {
          console.error("Error incrementing streak:", err);
          set({
            error:
              err instanceof Error ? err.message : "Failed to update streak",
            loading: false,
          });

          return {
            success: false,
            streakData: get().streakData || {
              currentStreak: 0,
              longestStreak: 0,
              lastCompletionDate: null,
              lastCompletionTimezone:
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            streakIncremented: false,
            streakReset: false,
            message: "Error updating streak",
          };
        }
      },

      // Reset streak to 0
      resetStreak: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          const resetData = await resetUserStreak(userId);

          set({
            streakData: resetData,
            lastSyncTime: Date.now(),
            loading: false,
          });
        } catch (err) {
          console.error("Error resetting streak:", err);
          set({
            error:
              err instanceof Error ? err.message : "Failed to reset streak",
            loading: false,
          });
        }
      },

      // Get current streak count
      getStreak: () => {
        const { streakData } = get();
        return streakData?.currentStreak || 0;
      },

      // Check if streak should be maintained or reset
      checkAndUpdateStreak: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          // Sync with server if needed
          if (get()._shouldSync()) {
            await get().fetchStreak(userId);
          }

          const currentData = get().streakData;

          if (!currentData) {
            await get().fetchStreak(userId);
            return get().checkAndUpdateStreak(userId);
          }

          const timezone =
            currentData.lastCompletionTimezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const today = getCurrentDateInTimezone(timezone);

          // If no last completion date, nothing to check
          if (!currentData.lastCompletionDate) {
            set({ loading: false });
            return {
              success: true,
              streakData: currentData,
              streakIncremented: false,
              streakReset: false,
              message: "No previous completion",
            };
          }

          // If last completion was today, streak is current
          if (isToday(currentData.lastCompletionDate, timezone)) {
            set({ loading: false });
            return {
              success: true,
              streakData: currentData,
              streakIncremented: false,
              streakReset: false,
              message: "Streak is current",
            };
          }

          // Check if streak should be reset (missed a day)
          if (
            !areConsecutiveDays(currentData.lastCompletionDate, today) &&
            daysBetween(currentData.lastCompletionDate, today) > 1
          ) {
            // Reset streak
            const resetData: StreakData = {
              currentStreak: 0,
              longestStreak: currentData.longestStreak,
              lastCompletionDate: null, // Clear last completion
              lastCompletionTimezone: timezone,
            };

            const savedData = await upsertUserStreak(userId, resetData);

            set({
              streakData: savedData,
              lastSyncTime: Date.now(),
              loading: false,
            });

            return {
              success: true,
              streakData: savedData,
              streakIncremented: false,
              streakReset: true,
              message: "Streak reset due to missed day",
            };
          }

          // Streak is valid and doesn't need updating
          set({ loading: false });
          return {
            success: true,
            streakData: currentData,
            streakIncremented: false,
            streakReset: false,
            message: "Streak is valid",
          };
        } catch (err) {
          console.error("Error checking streak:", err);
          set({
            error:
              err instanceof Error ? err.message : "Failed to check streak",
            loading: false,
          });

          return {
            success: false,
            streakData: get().streakData || {
              currentStreak: 0,
              longestStreak: 0,
              lastCompletionDate: null,
              lastCompletionTimezone:
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            streakIncremented: false,
            streakReset: false,
            message: "Error checking streak",
          };
        }
      },

      // Clear any error
      clearError: () => set({ error: null }),

      // Internal helper to update local streak data
      _updateLocalStreak: (data: StreakData) => {
        set({ streakData: data });
      },

      // Check if we should sync with server
      _shouldSync: () => {
        const { lastSyncTime } = get();
        if (!lastSyncTime) return true;

        const now = Date.now();
        return now - lastSyncTime > SYNC_INTERVAL;
      },
    }),
    {
      name: "streak-storage",
      partialize: (state) => ({
        streakData: state.streakData,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

export default useStreakStore;
