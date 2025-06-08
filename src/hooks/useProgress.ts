import { useEffect, useState } from "react";
import { getOrCreateProgress } from "../services/progress";
import type { UserProgress } from "../types";

export const useProgress = (userId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use getOrCreateProgress to handle both existing and new users
        const progressData = await getOrCreateProgress(userId);
        setProgress(progressData);
        console.log("pop");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load your progress.";
        setError(errorMessage);
        console.error("Error fetching progress:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  return { progress, isLoading, error };
};