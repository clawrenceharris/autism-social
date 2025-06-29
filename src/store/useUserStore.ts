import { persist } from "zustand/middleware";
import type { Goal, Interest, UserProfile } from "../types";
import { create } from "zustand";
import * as userService from "../services/user";
import { signOut } from "../services/auth";

interface ProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  goals: Goal[];
  interests: Interest[];
  setProfile: (profile: UserProfile) => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      goals: [],
      interests: [],
      loading: false,
      error: null,

      setProfile: (profile) => set({ profile, loading: false }),

      fetchUserProfile: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          const profile = await userService.getUserById(userId);
          if (profile === null) {
            console.error("User profile not found:", {
              userId: userId,
              message: "Profile record does not exist in database",
            });
            throw new Error(
              "User profile not found. Please contact support or try signing up again."
            );
          }

          set({ profile, loading: false });
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : String(err) || "Unknown error while loading user data";

          set({ error: errorMessage, loading: false });
        }
      },

      logout: async () => {
        try {
          set({ profile: null, loading: true, error: null });

          await signOut();

          set({
            profile: null,
            goals: [],
            interests: [],
            error: null,
            loading: false,
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error during logout";

          set({
            error: errorMessage,
            loading: false,
          });
        }
      },
    }),
    {
      name: "user-storage", // key for localStorage
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
