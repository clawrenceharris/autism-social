import { createContext, useContext, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useUserStore, type UserStore } from "../store/useUserStore";
import { useToast } from "./ToastContext";

const UserContext = createContext<UserStore | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userStore = useUserStore();
  const { showToast } = useToast();

  useEffect(() => {
    userStore.fetchUserAndProfile();
  }, [userStore.fetchUserAndProfile]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_OUT" || !session?.user) {
          userStore.logout();
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        showToast("Authentication error occurred", { type: "error" });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [userStore.logout, showToast]);

  return (
    <UserContext.Provider value={userStore}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}