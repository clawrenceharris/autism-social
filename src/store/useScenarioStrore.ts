// stores/useScenarioStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dialogue, Scenario } from "../types";
import { deleteScenario, getScenarios } from "../services/scenarios";
import {
  getCompletedDialogues,
  getDialogues,
  getScenarioDialogues,
} from "../services/dialogues";

interface ScenarioStore {
  scenarios: Record<string, Scenario>;
  completedDialogues: Record<string, Dialogue>;
  dialogues: Record<string, Dialogue>;
  scenarioDialogues: Record<string, Dialogue>;

  scenarioIds: string[];
  dialogueIds: string[];
  scenariosLoading: boolean;
  dialoguesLoading: boolean;
  error: string | null;
  fetchDialogues: () => void;
  fetchScenarioDialogues: (scenarioId: string) => void;
  clearDialogues: () => void;

  fetchScenarios: () => void;
  fetchCompletedScenarios: (userId: string) => void;
  clearScenarios: () => void;
  deleteScenario: (id: string) => Promise<void>;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: {},
      dialogues: {},
      completedDialogues: {},
      scenarioDialogues: {},
      scenarioIds: [],
      dialogueIds: [],
      scenariosLoading: false,
      dialoguesLoading: false,
      error: null,
      fetchDialogues: async () => {
        set({ dialoguesLoading: true, error: null });

        try {
          const scenarios = (await getDialogues()) || [];
          set({ scenarioIds: scenarios.map((dialogue) => dialogue.id) });
          set({
            dialogues:
              scenarios.reduce<Record<string, Dialogue>>((acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              }, {}) || {},
            dialoguesLoading: false,
          });
        } catch {
          set({ error: "Could not load dialogues", dialoguesLoading: false });
        }
      },
      fetchScenarios: async () => {
        set({ scenariosLoading: true, error: null });
        try {
          const scenarios = (await getScenarios()) || [];

          set({ scenarioIds: scenarios.map((scenario) => scenario.id) });
          set({
            scenarios: scenarios.reduce<Record<string, Scenario>>(
              (acc, scenario) => {
                acc[scenario.id] = scenario;
                return acc;
              },
              {}
            ),
            scenariosLoading: false,
          });
        } catch {
          set({ error: "Failed to load scenarios", scenariosLoading: false });
        }
      },
      fetchCompletedScenarios: async (userId: string) => {
        try {
          const dialogues = (await getCompletedDialogues(userId)) || [];

          set({
            completedDialogues: dialogues.reduce<Record<string, Dialogue>>(
              (acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              },
              {}
            ),
            scenariosLoading: false,
          });
        } catch {
          set({
            error: "Could not load completed scenarios",
            scenariosLoading: false,
          });
        }
      },
      fetchScenarioDialogues: async (scenarioId: string) => {
        set({ scenariosLoading: true, error: null });
        try {
          const dialogues = (await getScenarioDialogues(scenarioId)) || [];
          set({ dialogueIds: dialogues.map((dialogue) => dialogue.id) });
          set({
            scenarioDialogues:
              dialogues?.reduce<Record<string, Dialogue>>((acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              }, {}) || {},
            scenariosLoading: false,
          });
        } catch {
          set({ error: "Failed to load scenarios", scenariosLoading: false });
        }
      },

      clearDialogues: () => set({ dialogues: {} }),

      deleteScenario: async (id: string) => {
        try {
          const scenarios = get().scenarios;
          await deleteScenario(id);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = scenarios;
          set({ scenarios: rest });
        } catch (err) {
          set({ error: "Failed to delete scenario", scenariosLoading: false });

          throw err;
        }
      },

      clearScenarios: () => set({ scenarios: {} }),
    }),
    {
      name: "scenarios-storage",
      partialize: (state) => ({
        scenarios: state.scenarios,
      }),
    }
  )
);
