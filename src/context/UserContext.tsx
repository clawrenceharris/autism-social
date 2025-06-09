import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useAppDispatch, useUser } from "../store/hooks";
import { userThunks } from "../store/thunks/userThunks";
import type { UserProfile } from "../types";

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { user: profile, error, loading } = useUser();
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      dispatch(userThunks.updateUser({ data: updates, id: user.id }));
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      dispatch(userThunks.fetchUserById({ userId: user.id }));
      dispatch(userThunks.fetchUserGoals({ userId: user.id }));
      dispatch(userThunks.fetchUserInterests({ userId: user.id }));
    }
  }, [dispatch, user]);

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
