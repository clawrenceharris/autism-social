import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllDialogues, 
  getScenarioDialogues, 
  getDialogueById,
  createDialogue,
  updateDialogue,
  deleteDialogue
} from '../../services/dialogues';
import type { Dialogue, CreateDialogueData } from '../../types';

export const DIALOGUES_QUERY_KEY = ['dialogues'] as const;
export const SCENARIO_DIALOGUES_QUERY_KEY = (scenarioId: string) => 
  ['dialogues', 'scenario', scenarioId] as const;
export const DIALOGUE_QUERY_KEY = (id: string) => 
  ['dialogues', id] as const;

export function useDialogues() {
  return useQuery({
    queryKey: DIALOGUES_QUERY_KEY,
    queryFn: getAllDialogues,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useScenarioDialogues(scenarioId: string) {
  return useQuery({
    queryKey: SCENARIO_DIALOGUES_QUERY_KEY(scenarioId),
    queryFn: () => getScenarioDialogues(scenarioId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!scenarioId, // Only run if scenarioId exists
  });
}

export function useDialogue(id: string) {
  return useQuery({
    queryKey: DIALOGUE_QUERY_KEY(id),
    queryFn: () => getDialogueById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id exists
  });
}

export function useCreateDialogue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDialogueData) => createDialogue(data),
    onSuccess: (newDialogue) => {
      // Add to all dialogues cache
      queryClient.setQueryData<Dialogue[]>(DIALOGUES_QUERY_KEY, (old) => {
        return old ? [...old, newDialogue] : [newDialogue];
      });
      
      // Add to scenario dialogues cache
      queryClient.setQueryData<Dialogue[]>(
        SCENARIO_DIALOGUES_QUERY_KEY(newDialogue.scenario_id), 
        (old) => {
          return old ? [...old, newDialogue] : [newDialogue];
        }
      );
      
      // Set individual dialogue cache
      queryClient.setQueryData(DIALOGUE_QUERY_KEY(newDialogue.id), newDialogue);
    },
  });
}

export function useUpdateDialogue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dialogue> }) => 
      updateDialogue(id, data),
    onSuccess: (updatedDialogue) => {
      // Update in all dialogues cache
      queryClient.setQueryData<Dialogue[]>(DIALOGUES_QUERY_KEY, (old) => {
        return old?.map(dialogue => 
          dialogue.id === updatedDialogue.id ? updatedDialogue : dialogue
        ) || [];
      });
      
      // Update in scenario dialogues cache
      queryClient.setQueryData<Dialogue[]>(
        SCENARIO_DIALOGUES_QUERY_KEY(updatedDialogue.scenario_id), 
        (old) => {
          return old?.map(dialogue => 
            dialogue.id === updatedDialogue.id ? updatedDialogue : dialogue
          ) || [];
        }
      );
      
      // Update individual dialogue cache
      queryClient.setQueryData(DIALOGUE_QUERY_KEY(updatedDialogue.id), updatedDialogue);
    },
  });
}

export function useDeleteDialogue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteDialogue(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.setQueryData<Dialogue[]>(DIALOGUES_QUERY_KEY, (old) => {
        return old?.filter(dialogue => dialogue.id !== deletedId) || [];
      });
      
      // Remove from all scenario dialogues caches
      queryClient.getQueryCache().findAll({
        predicate: (query) => {
          return query.queryKey[0] === 'dialogues' && 
                 query.queryKey[1] === 'scenario';
        }
      }).forEach((query) => {
        queryClient.setQueryData<Dialogue[]>(query.queryKey, (old) => {
          return old?.filter(dialogue => dialogue.id !== deletedId) || [];
        });
      });
      
      // Remove individual dialogue cache
      queryClient.removeQueries({ queryKey: DIALOGUE_QUERY_KEY(deletedId) });
    },
  });
}