import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dialogue, Scenario } from "../types";

interface PlayScenarioStore {
  setUserFields: (fields: Record<string, string>) => void;
  userFields: Record<string, string> | null;
  dialogue: Dialogue | null;
  scenario: Scenario | null;
  setDialogue: (dialogue: Dialogue | null) => void;
  setScenario: (scenario: Scenario | null) => void;
}

export const usePlayScenarioStore = create<PlayScenarioStore>()(
  persist(
    (set) => ({
      dialogue: null,
      scenario: null,
      userFields: null,

      setUserFields: async (userFields: Record<string, string>) => {
        set({ userFields });
      },
      setDialogue: (dialogue: Dialogue | null) => {
        set({ dialogue });
      },
      setScenario: (scenario: Scenario | null) => {
        set({ scenario });
      },
    }),

    {
      name: "scenarios-storage",
      partialize: (state) => ({
        dialogue: state.dialogue,
        scenario: state.scenario,
        userFields: state.userFields,
      }),
    }
  )
);
