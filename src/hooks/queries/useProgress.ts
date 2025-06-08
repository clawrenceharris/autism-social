import { useQuery } from "@tanstack/react-query";
import { getProgress } from "../../services/progress";

export const PROGRESS_QUERY_KEY = (userId: string) =>
  ["user_progress", userId] as const;

export function useProgress(userId: string) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEY(userId),
    queryFn: () => getProgress(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
