import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScenarios, createScenario, updateScenario, deleteScenario } from '../../services/scenarios';
import type { Scenario, CreateScenarioData } from '../../types';

export const SCENARIOS_QUERY_KEY = ['scenarios'] as const;

export function useScenarios() {
  return useQuery({
    queryKey: SCENARIOS_QUERY_KEY,
    queryFn: getScenarios,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateScenarioData) => createScenario(data),
    onSuccess: (newScenario) => {
      // Add the new scenario to the cache
      queryClient.setQueryData<Scenario[]>(SCENARIOS_QUERY_KEY, (old) => {
        return old ? [...old, newScenario] : [newScenario];
      });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Scenario> }) => 
      updateScenario(id, data),
    onSuccess: (updatedScenario) => {
      // Update the scenario in the cache
      queryClient.setQueryData<Scenario[]>(SCENARIOS_QUERY_KEY, (old) => {
        return old?.map(scenario => 
          scenario.id === updatedScenario.id ? updatedScenario : scenario
        ) || [];
      });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteScenario(id),
    onSuccess: (_, deletedId) => {
      // Remove the scenario from the cache
      queryClient.setQueryData<Scenario[]>(SCENARIOS_QUERY_KEY, (old) => {
        return old?.filter(scenario => scenario.id !== deletedId) || [];
      });
    },
  });
}