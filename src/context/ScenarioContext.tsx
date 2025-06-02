import React, { createContext, useContext, useEffect, useState } from "react";
import { Scenario } from "../types";
import { useParams } from "react-router-dom";
import { fetchScenarioById } from "../api/scenario";
interface AuthContextProps {
  children: React.ReactNode;
  scenarioId: string;
}

export type AuthContextType = {
  scenario: Scenario | null;
  error: string | null;

  loading: boolean;
};
const ScenarioContext = createContext<AuthContextType | undefined>(undefined);

const ScenarioProvider = ({ children, scenarioId }: AuthContextProps) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchScenario = async () => {
      if (!scenarioId) {
        console.log("No Id");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const scenario = await fetchScenarioById(scenarioId);
        setScenario(scenario);
        setLoading(false);
      } catch (error: any) {
        setError(error);
        setLoading(false);
      }
    };
    fetchScenario();
  }, [scenarioId]);
  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        loading,

        error,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

function useScenario() {
  const context = useContext(ScenarioContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { ScenarioProvider, useScenario };
