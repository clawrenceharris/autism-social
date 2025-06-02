import { useEffect, useState } from "react";
import type { Dialogue } from "../types";
import { getDialogues } from "../services/scenarios";

const useDialogues = (scenarioId: string) => {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        setLoading(true);
        const dialogues = await getDialogues(scenarioId);

        setDialogues(dialogues || []);
        setLoading(false);
      } catch (error: any) {
        setError(error);
        setLoading(false);
      }
    };
    fetchVariations();
  }, []);

  return { dialogues, loading, error };
};

export default useDialogues;
