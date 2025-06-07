import { useQuery } from '@tanstack/react-query';
import { getRecommendedScenarios, type RecommendationOptions } from '../../services/recommendations';
import { useAuth } from '../../context/AuthContext';

export const RECOMMENDATIONS_QUERY_KEY = (userId: string, options?: RecommendationOptions) => 
  ['recommendations', userId, options] as const;

export function useRecommendations(options: RecommendationOptions = {}) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: user ? RECOMMENDATIONS_QUERY_KEY(user.id, options) : ['recommendations', 'anonymous'],
    queryFn: () => user ? getRecommendedScenarios(user.id, options) : Promise.resolve([]),
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
    enabled: !!user, // Only run if user is authenticated
  });
}

export function useAdvancedRecommendations(
  options: RecommendationOptions & {
    preferredDifficulty?: string[];
    excludeCategories?: string[];
    boostRecentlyAdded?: boolean;
  } = {}
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: user ? ['advanced-recommendations', user.id, options] : ['advanced-recommendations', 'anonymous'],
    queryFn: () => user ? getRecommendedScenarios(user.id, options) : Promise.resolve([]),
    staleTime: 10 * 60 * 1000,
    enabled: !!user,
  });
}