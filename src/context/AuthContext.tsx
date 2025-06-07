import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
        console.log("Auth state change:", event, session?.user?.id);

        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          setIsAdmin(false);
          setError(null);
        } else if (session?.user) {
          setUser(session.user);

          // Fetch user role with timeout
          try {
            const rolePromise = supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();

            // Add timeout to role fetch
            const roleTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Role fetch timeout")), 10000)
            );

            const result = (await Promise.race([rolePromise, roleTimeout])) as {
              data: { role: string } | null;
            };
            const roleData = result.data;

            setIsAdmin(roleData?.role === "admin");
          } catch (roleError) {
            console.warn("Failed to fetch user role:", roleError);
            // Continue without role - user can still access the app
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setError("Authentication error occurred");
      } finally {
        setLoading(false);
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
