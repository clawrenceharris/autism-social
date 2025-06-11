import { createContext, useContext, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ToastContext";
import { useUserStore } from "../store/useUserStore";

const UserContext = createContext<undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { fetchUserAndProfile, logout } = useUserStore();
  const { showToast } = useToast();

  useEffect(() => {
    fetchUserAndProfile();
  }, [fetchUserAndProfile]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_OUT" || !session?.user) {
          logout();
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        showToast("Authentication error occurred", { type: "error" });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [logout, showToast]);

  return (
    <UserContext.Provider value={undefined}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
