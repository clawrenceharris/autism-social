import { useEffect, useState } from "react";
import type { Dialogue } from "../types";
import { getScenarioDialogues } from "../services/dialogues";

const useScenarioDialogues = (scenarioId: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioDialogues, setScenarioDialogues] = useState<Dialogue[]>([]);
  const addDialogue = (dialogue: Dialogue) => {
    setScenarioDialogues((prev) => [...prev, dialogue]);
  };
  useEffect(() => {
    const fetchScenarioDialogues = async () => {
      try {
        setLoading(true);
        const data = await getScenarioDialogues(scenarioId);
        setScenarioDialogues(data || []);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
        setLoading(false);
      }
    };
    fetchScenarioDialogues();
  }, [scenarioId]);

  return { addDialogue, scenarioDialogues, loading, error };
};

export default useScenarioDialogues;
