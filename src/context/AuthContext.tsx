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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    fetchUserAndProfile,
    setUser,
    user,
    profile,
    loading,
  } = useUserStore();

  useEffect(() => {
    fetchUserAndProfile();
  }, [fetchUserAndProfile]);
  useEffect(() => {
   
    // Fallback timeout to ensure loading state is eventually set to false
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timeout");
        setLoading(false);
      }
    }, 15000);

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
      } finally {
        clearTimeout(fallbackTimeout);
      }
    });

    return () => {
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, [loading]);

  return (
    <AuthContext.Provider value={{ user, loading, error, isAdmin }}>
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
