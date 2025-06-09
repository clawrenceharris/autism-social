import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoals, updateUserGoals } from "../../services/goals";
import { useAuth } from "../../context/AuthContext";

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

export function useAddUserGoals() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (goalIds: string[]) => {
      if (!user) throw new Error("User not authenticated");
      return updateUserGoals(user.id, goalIds);
    },
    onSuccess: () => {
      if (user) {
        // Invalidate user goals and recommendations
        queryClient.invalidateQueries({
          queryKey: USER_GOALS_QUERY_KEY(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: ["recommendations", user.id],
        });
      }
    },
  });
}
