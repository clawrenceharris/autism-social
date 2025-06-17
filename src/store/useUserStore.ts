import type { User } from "@supabase/supabase-js";
import { persist } from "zustand/middleware";
import type { Goal, Interest, UserProfile } from "../types";
import { create } from "zustand";
import * as userService from "../services/user";
import { signOut } from "../services/auth";

interface UserStore {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  goals: Goal[];
  interests: Interest[];
  setUser: (user: User) => void;
  setProfile: (profile: UserProfile) => void;
  fetchUserData: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      goals: [],
      interests: [],
      loading: true,
      error: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      fetchUserData: async (userId: string) => {
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

          set({ profile });
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Unknown error while loading user data";

          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ user: null, profile: null, loading: true, error: null });

          await signOut();

          set({
            user: null,
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
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
