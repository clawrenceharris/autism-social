import { useEffect, useState } from "react";
import type { Dialogue } from "../types";
import { getAllDialogues } from "../services/dialogues";

const useDialogues = () => {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDialogues = async () => {
      try {
        setLoading(true);
        const dialogues = await getAllDialogues();

        setDialogues(dialogues || []);
        setLoading(false);
      } catch {
        setError("Error getting dilaogues");
        setLoading(false);
      }
    };

    fetchDialogues();
  }, []);

  return { dialogues, loading, error };
};

export default useDialogues;
