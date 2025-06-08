import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProgress } from '../../services/progress';
export const PROGRESS_QUERY_KEY = (userId: string) =>  ["user_progress", userId] as const;

export function useProgress() {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEY,
    queryFn: getProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
