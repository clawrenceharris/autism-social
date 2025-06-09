import { useQuery } from "@tanstack/react-query";
import { getRecommendedDialogues } from "../../services/recommendations";

export const RECOMMENDATIONS_QUERY_KEY = (userId: string) =>
  ["recommendations", userId] as const;

export function useRecommendations(userId: string) {
  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEY(userId),

    queryFn: () => getRecommendedDialogues(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
  });
}

// export function useAdvancedRecommendations(
//   options: RecommendationOptions & {
//     preferredDifficulty?: string[];
//     excludeCategories?: string[];
//     boostRecentlyAdded?: boolean;
//   } = {}
// ) {
//   const { user } = useAuth();

//   return useQuery({
//     queryKey: user ? ['advanced-recommendations', user.id, options] : ['advanced-recommendations', 'anonymous'],
//     queryFn: () => user ? getRecommendedDialogues(user.id, options) : Promise.resolve([]),
//     staleTime: 10 * 60 * 1000,
//     enabled: !!user,
//   });
// }
