import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScenarioWithDialogues } from "../types";
import { getScenarios } from "../services/scenarios";
import { getDialoguesByScenarioId } from "../services/dialogues";

interface ScenarioStore {
  scenarios: Record<string, ScenarioWithDialogues>;
  scenarioIds: string[];
  loading: boolean;
  error: string | null;

  fetchScenarios: () => Promise<void>;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set) => ({
      scenarios: {},
      loading: false,
      selectedScenario: null,
      scenarioIds: [],
      scenariosLoading: false,
      dialoguesLoading: false,
      error: null,

      fetchScenarios: async () => {
        try {
          set({ loading: true, error: null });
          const scenarios = (await getScenarios()) || [];
          set({ scenarioIds: scenarios.map((scenario) => scenario.id) });

          const scenariosWithDialogues: Record<string, ScenarioWithDialogues> =
            {};
          for (const scenario of scenarios) {
            const dialogues = await getDialoguesByScenarioId(scenario.id);
            scenariosWithDialogues[scenario.id] = {
              ...scenario,
              dialogues,
            } as ScenarioWithDialogues;
          }
          set({
            scenarios: scenariosWithDialogues,
          });
        } catch {
          set({ error: "Failed to load scenarios" });
        } finally {
          set({
            loading: false,
          });
        }
      },
    }),
    {
      name: "scenarios-storage",
      partialize: (state) => ({
        scenarios: state.scenarios,
        scenarioIds: state.scenarioIds,
      }),
    }
  )
);
