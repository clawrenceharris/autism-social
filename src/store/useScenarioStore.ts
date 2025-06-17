import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Scenario } from "../types";
import { getScenarios } from "../services/scenarios";

interface ScenarioStore {
  scenarios: Record<string, Scenario>;
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
