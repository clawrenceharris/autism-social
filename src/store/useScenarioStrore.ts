// stores/useScenarioStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Scenario } from "../types";
import { deleteScenario, getScenarios } from "../services/scenarios";

interface ScenarioStore {
  scenarios: Record<string, Scenario>;
  ids: string[];
  loading: boolean;
  error: string | null;
  fetchScenarios: () => void;
  clearScenarios: () => void;
  deleteScenario: (id: string) => Promise<void>;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: {},
      ids: [],
      loading: false,
      error: null,

      fetchScenarios: async () => {
        set({ loading: true, error: null });
        try {
          const scenarios = (await getScenarios()) || [];
          set({ ids: scenarios.map((scenario) => scenario.id) });
          set({
            scenarios: scenarios.reduce<Record<string, Scenario>>(
              (acc, scenario) => {
                acc[scenario.id] = scenario;
                return acc;
              },
              {}
            ),
            loading: false,
          });
        } catch {
          set({ error: "Failed to load scenarios", loading: false });
        }
      },
      deleteScenario: async (id: string) => {
        try {
          const scenarios = get().scenarios;
          await deleteScenario(id);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = scenarios;
          set({ scenarios: rest });
        } catch (err) {
          set({ error: "Failed to delete scenario", loading: false });

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
