import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  goals: string[];
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setProfile(data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error("No user or profile available");
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
    } catch (err) {
      console.error("Error updating user profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}