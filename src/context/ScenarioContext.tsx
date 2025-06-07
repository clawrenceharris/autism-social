import React, { createContext, useContext, useEffect, useState } from "react";
import { getScenarioById } from "../services/scenarios";
import type { Scenario } from "../types";
interface AuthContextProps {
  children: React.ReactNode;
  scenarioId: string;
}

type ScenarioContextType = {
  scenario: Scenario | null;
  error: string | null;

  loading: boolean;
};
const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined
);

const ScenarioProvider = ({ children, scenarioId }: AuthContextProps) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchScenario = async () => {
      if (!scenarioId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const scenario = await getScenarioById(scenarioId);
        setScenario(scenario);
        setLoading(false);
      } catch {
        setError("Error getting Scenario");
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
