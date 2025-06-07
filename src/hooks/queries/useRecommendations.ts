import { useQuery } from '@tanstack/react-query';
import { getRecommendedScenarios } from '../../services/recommendations';
import { useAuth } from '../../context/AuthContext';

export const RECOMMENDATIONS_QUERY_KEY = (userId: string) => 
  ['recommendations', userId] as const;

export function useRecommendations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: user ? RECOMMENDATIONS_QUERY_KEY(user.id) : ['recommendations', 'anonymous'],
    queryFn: () => user ? getRecommendedScenarios(user.id) : Promise.resolve([]),
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
    enabled: !!user, // Only run if user is authenticated
  });
}