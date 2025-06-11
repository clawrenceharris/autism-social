import React, { createContext, useContext, useEffect, useState } from "react";
import { getScenarioById } from "../services/scenarios";
import type { Dialogue, Scenario } from "../types";
import { getDialogueById } from "../services/dialogues";
import { useScenarioStore } from "../store/useScenarioStrore";

interface AuthContextProps {
  children: React.ReactNode;
  scenarioId?: string;
  dialogueId?: string;
}

type ScenarioContextType = {
  scenario: Scenario | null;
  dialogue: Dialogue | null;
  error: string | null;

  loading: boolean;
};
const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined
);

const ScenarioProvider = ({
  children,
  dialogueId,
  scenarioId,
}: AuthContextProps) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const { fetchScenarios } = useScenarioStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchScenario = async (id: string) => {
      try {
        setLoading(true);
        const scenario = await getScenarioById(id);
        setScenario(scenario);
        setLoading(false);
      } catch {
        setError("Error getting Scenario");
        setLoading(false);
      }
    };
    const fetchDialogue = async (id: string) => {
      if (!dialogueId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const dialogue = await getDialogueById(id);
        setDialogue(dialogue);
        setLoading(false);
      } catch {
        setError("Error getting Scenario");
        setLoading(false);
      }
    };
    if (scenarioId) {
      fetchScenario(scenarioId);
    }
    if (dialogueId) {
      fetchDialogue(dialogueId);
    }
  }, [scenarioId, dialogueId]);
  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);
  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        dialogue,
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
