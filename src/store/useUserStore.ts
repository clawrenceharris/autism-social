import type { User } from "@supabase/supabase-js";
import { persist } from "zustand/middleware";
import type { Goal, Interest, UserProfile } from "../types";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import * as userService from "../services/user";

interface UserStore {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  goals: Goal[];
  interests: Interest[];
  setUser: (user: User) => void;
  setProfile: (profile: UserProfile) => void;
  fetchUserData: (userId: string) => void;
  logout: () => void;
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
          // Step 4: Fetch user profile

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
          console.error("Failed to fetch user profile:", {
            userId: userId,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          });
          throw err; // This is critical, so we throw
        } finally {
          set({ loading: false });

        }
      },

      logout: async () => {
        try {
          console.log("🔄 Starting logout process...");
          set({ user: null, profile: null, loading: true, error: null });

          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error("Logout error:", {

              message: error.message,
              status: error.status,
              name: error.name,
            });

            throw error;
          } else {

            set({
              user: null,
              profile: null,
              goals: [],
              interests: [],
              error: null,
              loading: false,
            });
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error during logout";

          console.error("Unexpected error while loggin out", {

            error: errorMessage,
            errorType: err instanceof Error ? err.constructor.name : typeof err,
            stack: err instanceof Error ? err.stack : undefined,
            timestamp: new Date().toISOString(),
          });

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