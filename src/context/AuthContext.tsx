import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useUserStore } from "../store/useUserStore";
import type { UserProfile } from "../types";

const AuthContext = createContext<
  | {
      user: User | null;
      loading: boolean;
      error: string | null;
      isAdmin: boolean;
      profile: UserProfile | null;
    }
  | undefined
>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { fetchUserData, setUser, user, loading, profile } = useUserStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_OUT" || !session?.user) {
          setIsAdmin(false);
          setError(null);
        } else if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setError("Authentication error occurred");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
