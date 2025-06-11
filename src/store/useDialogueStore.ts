// stores/useDialogueStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dialogue } from "../types";
import * as dialogueService from "../services/dialogues";
import * as recommendationService from "../services/recommendations";

interface DialogueStore {
  dialogues: Record<string, Dialogue>;
  ids: string[];
  recommended: Dialogue[];
  scenarioDialogues: Record<string, Dialogue>;
  loading: boolean;
  error: string | null;
  fetchRecommended: (userId: string) => void;
  fetchDialogues: () => void;
  fetchScenarioDialogues: (scenarioId: string) => void;
  clearDialogues: () => void;
}

export const useDialogueStore = create<DialogueStore>()(
  persist(
    (set) => ({
      dialogues: {},
      ids: [],
      scenarioDialogues: {},
      recommended: [],
      loading: false,
      error: null,

      fetchDialogues: async () => {
        set({ loading: true, error: null });

        try {
          const scenarios = (await dialogueService.getDialogues()) || [];
          set({ ids: scenarios.map((dialogue) => dialogue.id) });
          set({
            dialogues:
              scenarios.reduce<Record<string, Dialogue>>((acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              }, {}) || {},
            loading: false,
          });
        } catch {
          set({ error: "Failed to load scenarios", loading: false });
        }
      },
      fetchRecommended: async (userId: string) => {
        try {
          const recommended =
            await recommendationService.getRecommendedDialogues(userId);
          set({
            recommended,
            loading: false,
          });
        } catch {
          set({
            error: "Failed to load recommended Dialogues",
            loading: false,
          });
        }
      },
      fetchScenarioDialogues: async (scenarioId: string) => {
        set({ loading: true, error: null });
        try {
          const scenarios = await dialogueService.getScenarioDialogues(
            scenarioId
          );
          set({
            scenarioDialogues:
              scenarios?.reduce<Record<string, Dialogue>>((acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              }, {}) || {},
            loading: false,
          });
        } catch {
          set({ error: "Failed to load scenarios", loading: false });
        }
      },
      clearDialogues: () => set({ dialogues: {} }),
    }),
    {
      name: "dialogues-storage",
      partialize: (state) => ({
        dialogues: state.dialogues,
      }),
    }
  )
);
