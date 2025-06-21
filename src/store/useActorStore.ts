import { create } from "zustand";

import type { Actor } from "../types";
import { getActors } from "../services/actors";

interface ActorStore {
  actors: Record<string, Actor>;
  loading: boolean;
  error: string | null;
  selectedActor: Actor | null;
  setActor: (actor: Actor | null) => void;
  fetchActors: () => void;
}
export const useActorStore = create<ActorStore>((set) => ({
  actors: {},
  loading: false,
  selectedActor: null,
  error: null,

  fetchActors: async () => {
    try {
      set({ loading: true, error: null });

      const actors = await getActors();

      set({
        actors: actors.reduce<Record<string, Actor>>((acc, actor) => {
          acc[actor.id] = actor;
          return acc;
        }, {}),
      });
    } catch (err) {
      console.log(
        "Error fetching actors: " +
          (err instanceof Error ? err.message : String(err))
      );
      set({ error: "Failed to load actors" });
    } finally {
      set({ loading: false });
    }
  },
  setActor: (actor: Actor | null) => {
    set({ selectedActor: actor });
  },
}));
