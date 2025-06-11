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
  fetchUserAndProfile: () => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      goals: [],
      interests: [],
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      fetchUserAndProfile: async () => {
        set({ loading: true });
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          set({ user });
          const goals = await userService.getUserGoals(user.id);
          set({ goals });
          const interests = await userService.getUserInterests(user.id);
          set({ interests });
          const profile = await userService.getUserById(user.id);

          if (profile) {
            set({ profile });
          }
        }

        set({ loading: false });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
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
