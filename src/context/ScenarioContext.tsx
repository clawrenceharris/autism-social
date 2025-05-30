import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Dialogue } from "../types";
interface AuthContextProps {
  children: React.ReactNode;
}

export type AuthContextType = {
  currentScenario: Dialogue | null;
  error: string | null;

  loading: boolean;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: AuthContextProps) {
  const [currentScenario, setCurrentScenario] = useState<Dialogue | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
  });

  return (
    <AuthContext.Provider
      value={{
        currentScenario,
        loading,

        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
