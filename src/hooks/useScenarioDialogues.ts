import { useEffect, useState } from "react";
import type { Dialogue } from "../types";
import { getDialogues } from "../services/scenarios";

const useScenarioDialogues = (scenarioId: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioDialogues, setScenarioDialogues] = useState<Dialogue[]>([]);

  useEffect(() => {
    const fetchScenarioDialogues = async () => {
      try {
        setLoading(true);
        const dialogues = await getDialogues(scenarioId);
        console.log({dialogues})
        setScenarioDialogues(dialogues || []);
        setLoading(false);
      } catch (error: any) {
        setError(error);
        setLoading(false);
      }
    };
    fetchScenarioDialogues();
  }, []);

  return { dialogues, loading, error };
};

export default useScenarioDialogues;
