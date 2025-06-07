import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInterests, addUserInterests } from '../../services/interests';
import { useAuth } from '../../context/AuthContext';

export const INTERESTS_QUERY_KEY = ['interests'] as const;
export const USER_INTERESTS_QUERY_KEY = (userId: string) => 
  ['user-interests', userId] as const;

export function useInterests() {
  return useQuery({
    queryKey: INTERESTS_QUERY_KEY,
    queryFn: getInterests,
    staleTime: 30 * 60 * 1000, // 30 minutes - interests rarely change
  });
}

export function useAddUserInterests() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (interestIds: string[]) => {
      if (!user) throw new Error('User not authenticated');
      return addUserInterests(user.id, interestIds);
    },
    onSuccess: () => {
      if (user) {
        // Invalidate user interests and recommendations
        queryClient.invalidateQueries({ 
          queryKey: USER_INTERESTS_QUERY_KEY(user.id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['recommendations', user.id] 
        });
      }
    },
  });
}