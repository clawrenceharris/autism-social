import React, { createContext, useContext, useEffect, useState } from "react";

import { useScenarioStore } from "../store/useScenarioStrore";
import { useUserStore } from "../store/useUserStore";
import type { Dialogue, Scenario } from "../types";

interface AuthContextProps {
  children: React.ReactNode;
  scenarioId?: string;
  dialogueId?: string;
}

interface AuthContextType {
  dialogue: Dialogue | null;
  scenario: Scenario | null;
}

const ScenarioContext = createContext<AuthContextType | undefined>(undefined);

const ScenarioProvider = ({
  children,
  dialogueId,
  scenarioId,
}: AuthContextProps) => {
  const { fetchScenarios, fetchDialogues } = useScenarioStore();
  const { user } = useUserStore();
  const {
    dialogues,
    scenarios,
    dialoguesLoading,
    scenariosLoading,
    fetchDialoguesByScenario,
  } = useScenarioStore();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  useEffect(() => {
    if (scenarioId && !scenariosLoading) {
      setScenario(scenarios[scenarioId]);
    }
    if (dialogueId && !dialoguesLoading) {
      setDialogue(dialogues[dialogueId]);
    }
  }, [
    dialogueId,
    dialogues,
    dialoguesLoading,
    fetchDialoguesByScenario,
    scenarioId,
    scenarios,
    scenariosLoading,
    setDialogue,
    setScenario,
  ]);

  useEffect(() => {
    if (dialogue) {
      fetchDialoguesByScenario(dialogue.id);
    }
  }, [dialogue, fetchDialoguesByScenario]);
  useEffect(() => {
    if (user) {
      fetchDialogues();
      fetchScenarios();
    }
  }, [fetchDialogues, fetchScenarios, user]);
  return (
    <ScenarioContext.Provider value={{ scenario, dialogue }}>
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
