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
  completedDialogueIds: string[];
  dialogues: Record<string, Dialogue>;
  dialoguesByScenario: Record<string, Dialogue[]>;
  selectedScenario: Scenario | null;
  selectedDialogue: Dialogue | null;
  scenarioIds: string[];
  dialogueIds: string[];
  scenariosLoading: boolean;
  dialoguesLoading: boolean;
  setDialogue: (dialogue: Dialogue | null) => void;
  setScenario: (scenario: Scenario | null) => void;
  error: string | null;
  fetchDialogues: () => void;
  fetchDialoguesByScenario: (scenarioId: string) => void;
  clearDialogues: () => void;

  fetchScenarios: () => void;
  fetchCompletedDialogues: (userId: string) => void;
  clearScenarios: () => void;
  deleteScenario: (id: string) => Promise<void>;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: {},
      dialogues: {},
      completedDialogues: {},
      completedDialogueIds: [],
      selectedDialogue: null,
      selectedScenario: null,
      dialoguesByScenario: {},
      scenarioIds: [],
      dialogueIds: [],
      scenariosLoading: false,
      dialoguesLoading: false,
      error: null,
      fetchDialogues: async () => {
        try {
          set({ dialoguesLoading: true, error: null });
          const scenarios = (await getDialogues()) || [];
          set({ scenarioIds: scenarios.map((dialogue) => dialogue.id) });
          set({
            dialogues:
              scenarios.reduce<Record<string, Dialogue>>((acc, dialogue) => {
                acc[dialogue.id] = dialogue;
                return acc;
              }, {}) || {},
          });
        } catch {
          set({ error: "Could not load dialogues", dialoguesLoading: false });
        } finally {
          set({
            dialoguesLoading: false,
          });
        }
      },
      fetchScenarios: async () => {
        try {
          set({ scenariosLoading: true, error: null });
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
          });
        } catch {
          set({ error: "Failed to load scenarios" });
        } finally {
          set({
            scenariosLoading: false,
          });
        }
      },
      fetchCompletedDialogues: async (userId: string) => {
        try {
          set({ scenariosLoading: true, error: null });

          const dialogues = (await getCompletedDialogues(userId)) || [];

          set({
            completedDialogueIds: dialogues.map((d) => d.id),
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
          });
        } finally {
          set({
            scenariosLoading: false,
          });
        }
      },
      fetchDialoguesByScenario: async (scenarioId: string) => {
        set({ dialoguesLoading: true, error: null });
        try {
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
          set({ error: "Failed to load dialogues", scenariosLoading: false });
        } finally {
          set({
            dialoguesLoading: false,
          });
        }
      },
      setDialogue: (dialogue: Dialogue | null) => {
        set({ selectedDialogue: dialogue });
      },
      setScenario: (scenario: Scenario | null) => {
        set({ selectedScenario: scenario });
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
        dialogues: state.dialogues,
        dialogueIds: state.dialogueIds,
        scenarioIds: state.scenarioIds,
        dialoguesByScenario: state.dialoguesByScenario,
      }),
    }
  )
);
