import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for common operations
export const useScenarios = () => {
  const dispatch = useAppDispatch();
  const scenarios = useAppSelector((state) => state.scenarios);
  
  return {
    scenarios: scenarios.ids.map(id => scenarios.items[id]),
    loading: scenarios.loading,
    error: scenarios.error,
    selectedScenario: scenarios.selectedScenarioId ? scenarios.items[scenarios.selectedScenarioId] : null,
    dispatch,
  };
};

export const useDialogues = () => {
  const dispatch = useAppDispatch();
  const dialogues = useAppSelector((state) => state.dialogues);
  
  return {
    dialogues: dialogues.ids.map(id => dialogues.items[id]),
    loading: dialogues.loading,
    error: dialogues.error,
    selectedDialogue: dialogues.selectedDialogueId ? dialogues.items[dialogues.selectedDialogueId] : null,
    byScenario: dialogues.byScenario,
    dispatch,
  };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);
  
  return {
    ...ui,
    dispatch,
  };
};