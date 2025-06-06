import React, { createContext, useContext, useEffect, useState } from "react";
import type { Scenario } from "../types";
import { supabase } from "../lib/supabase";

interface ScenarioContextProps {
  children: React.ReactNode;
  scenarioId: string;
}

export type ScenarioContextType = {
  scenario: Scenario | null;
  error: string | null;

  loading: boolean;
};

const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined
);

export const useScenario = () => {
  const context = useContext(ScenarioContext);

  if (context === undefined) {
    throw new Error("useScenario must be used within an ScenarioProvider");
  }
  return context;
};

export const ScenarioProvider = ({
  children,
  scenarioId,
}: ScenarioContextProps) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenarioId) {
      setLoading(false);
      return;
    }
    const fetchScenario = async () => {
      try {
        const { data: scenario } = await supabase
          .from("scenarios")
          .select("*")
          .eq("id", scenarioId)
          .single();
        setLoading(false);
        setScenario(scenario);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
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
