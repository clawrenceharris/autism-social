import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { useProfileStore } from "../store/useUserStore";
import type { UserProfile } from "../types";
import { useErrorHandler } from "../hooks";
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const {
    fetchUserProfile,
    loading: loadingProfile,
    profile,
  } = useProfileStore();
  const [loadingUser, setLoadingUser] = useState(true);
  const { handleError } = useErrorHandler();
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setUser(null);
        const err = handleError({ error, action: "loading user session" });
        setError(err.message);
        return;
      }
      if (!session?.user) {
        setUser(null);
        return;
      }
      setLoadingUser(false);

      setUser(session.user);
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (user) fetchUserProfile(user.id);
  }, [fetchUserProfile, user]);
  return (
    <AuthContext.Provider
      value={{ user, profile, loading: loadingProfile || loadingUser, error }}
    >
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
