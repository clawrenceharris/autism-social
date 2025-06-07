import { useEffect, useState } from "react";
import { getProgress,createProgress } from "../services/progress";
import type { UserProgress } from "../types";

export const useProgress = (userId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        let progress = null;
        setIsLoading(true);
        progress = await getProgress(userId);
        if(progress === null){
          progress = createProgress(userId)
        }
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
