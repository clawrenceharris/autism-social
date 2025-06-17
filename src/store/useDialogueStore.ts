import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dialogue } from "../types";
import { getDialogues, getScenarioDialogues } from "../services/dialogues";

interface DialogueStore {
  completedDialogues: Record<string, Dialogue>;
  completedDialogueIds: string[];
  dialogues: Record<string, Dialogue>;
  dialoguesByScenario: Record<string, Dialogue[]>;
  dialogueIds: string[];
  loading: boolean;
  error: string | null;
  fetchDialogues: () => void;
  fetchDialoguesByScenario: (scenarioId: string) => void;
}

export const useDialogueStore = create<DialogueStore>()(
  persist(
    (set) => ({
      dialogues: {},
      completedDialogues: {},
      completedDialogueIds: [],
      selectedDialogue: null,
      dialoguesByScenario: {},
      dialogueIds: [],
      loading: false,
      error: null,
      fetchDialogues: async () => {
        try {
          set({ loading: true, error: null });
          const dialogues = (await getDialogues()) || [];
          set({
            dialogues:
              dialogues.reduce<Record<string, Dialogue>>((acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              }, {}) || {},
          });
        } catch {
          set({ error: "Could not load dialogues" });
        } finally {
          set({
            loading: false,
          });
        }
      },

      fetchDialoguesByScenario: async (scenarioId: string) => {
        try {
          set({ loading: true, error: null });

          const dialogues = (await getScenarioDialogues(scenarioId)) || [];
          set({
            dialoguesByScenario:
              dialogues.reduce<Record<string, Dialogue[]>>((acc, dialogue) => {
                if (!acc[dialogue.scenario_id]) {
                  acc[dialogue.scenario_id] = [];
                }
                acc[dialogue.scenario_id].push(dialogue);

                return acc;
              }, {}) || {},
          });
        } catch {
          set({ error: "Failed to load dialogues" });
        } finally {
          set({
            loading: false,
          });
        }
      },
    }),
    {
      name: "dialogues-storage",
      partialize: (state) => ({
        dialogues: state.dialogues,
        dialogueIds: state.dialogueIds,
        dialoguesByScenario: state.dialoguesByScenario,
      }),
    }
  )
);
