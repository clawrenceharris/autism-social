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
  fetchUserData: () => void;
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

      fetchUserData: async () => {
        try {
          set({ loading: true, error: null });

          // Step 1: Get authenticated user
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError) {
            console.error("❌ Authentication error:", {
              message: authError.message,
              status: authError.status,
              name: authError.name,
            });
            throw new Error(`Authentication failed: ${authError.message}`);
          }

          if (!user) {
            console.warn("⚠️ No authenticated user found");
            set({ loading: false, user: null, profile: null });
            return;
          }

          console.log("✅ User authenticated:", {
            id: user.id,
            email: user.email,
          });

          set({ user });

          // Step 2: Fetch user goals
          try {
            const goals = await userService.getUserGoals(user.id);
            console.log("✅ User goals fetched:", {
              count: goals.length,
              goals: goals.map(g => g.goal),
            });
            set({ goals });
          } catch (goalsError) {
            console.error("❌ Failed to fetch user goals:", {
              userId: user.id,
              error: goalsError instanceof Error ? goalsError.message : String(goalsError),
              stack: goalsError instanceof Error ? goalsError.stack : undefined,
            });
            // Don't throw here, continue with other data
            set({ goals: [] });
          }

          // Step 3: Fetch user interests
          try {
            const interests = await userService.getUserInterests(user.id);
            console.log("✅ User interests fetched:", {
              count: interests.length,
              interests: interests.map(i => i.name),
            });
            set({ interests });
          } catch (interestsError) {
            console.error("❌ Failed to fetch user interests:", {
              userId: user.id,
              error: interestsError instanceof Error ? interestsError.message : String(interestsError),
              stack: interestsError instanceof Error ? interestsError.stack : undefined,
            });
            // Don't throw here, continue with other data
            set({ interests: [] });
          }

          // Step 4: Fetch user profile
          try {
            const profile = await userService.getUserById(user.id);
            if (profile === null) {
              console.error("❌ User profile not found:", {
                userId: user.id,
                message: "Profile record does not exist in database",
              });
              throw new Error("User profile not found. Please contact support or try signing up again.");
            }
            console.log("✅ User profile fetched:", {
              id: profile.id,
              firstName: profile.first_name,
              lastName: profile.last_name,
            });
            set({ profile });
          } catch (profileError) {
            console.error("❌ Failed to fetch user profile:", {
              userId: user.id,
              error: profileError instanceof Error ? profileError.message : String(profileError),
              stack: profileError instanceof Error ? profileError.stack : undefined,
            });
            throw profileError; // This is critical, so we throw
          }

          set({ loading: false });
          console.log("✅ User data fetch completed successfully");

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred while loading user data";
          
          console.error("❌ Critical error in fetchUserData:", {
            error: errorMessage,
            errorType: err instanceof Error ? err.constructor.name : typeof err,
            stack: err instanceof Error ? err.stack : undefined,
            timestamp: new Date().toISOString(),
          });

          set({ 
            error: errorMessage, 
            loading: false,
            // Clear user data on critical errors
            user: null,
            profile: null,
            goals: [],
            interests: [],
          });
        }
      },

      logout: async () => {
        try {
          console.log("🔄 Starting logout process...");
          set({ user: null, profile: null, loading: true, error: null });

          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error("❌ Logout error:", {
              message: error.message,
              status: error.status,
              name: error.name,
            });
            set({
              error: `Logout failed: ${error.message}`,
              loading: false,
            });
          } else {
            console.log("✅ Logout successful");
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
          const errorMessage = err instanceof Error ? err.message : "Unknown error during logout";
          
          console.error("❌ Unexpected logout error:", {
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