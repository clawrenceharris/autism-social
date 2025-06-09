import { useQuery } from "@tanstack/react-query";
import { getGoals } from "../../services/goals";

export const GOALS_QUERY_KEY = ["goals"] as const;
export const USER_GOALS_QUERY_KEY = (userId: string) =>
  ["user-goals", userId] as const;

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: getGoals,
    staleTime: 30 * 60 * 1000, // 30 minutes - goals rarely change
  });
}
