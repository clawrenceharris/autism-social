import { useEffect, useState } from "react";
import { getProgress } from "../services/progress";
import type { UserProgress } from "../types";

export const useProgress = (userId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const progress = await getProgress(userId);
        setProgress(progress);
      } catch (err) {
        setError("Failed to load your progress.");
        console.error("Error fetching progress: " + err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [userId]);

  return { progress, isLoading, error };
};
