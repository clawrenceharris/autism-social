import { create } from "zustand";

import type { Actor } from "../types";
import { getActors } from "../services/actors";
import { persist } from "zustand/middleware";

interface ActorStore {
  actors: Record<string, Actor>;
  actor: Actor | null;
  loading: boolean;
  error: string | null;
  setActor: (actor: Actor | null) => void;
  fetchActors: () => void;
}
export const useActorStore = create<ActorStore>()(
  persist(
    (set) => ({
      actors: {},
      actor: null,
      loading: false,
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
        } catch {
          set({ error: "Unable to load actors" });
        } finally {
          set({ loading: false });
        }
      },
      setActor: (actor: Actor | null) => {
        set({ actor });
      },
    }),
    {
      name: "actor-storage", // key for localStorage
      partialize: (state) => ({
        actors: state.actors,
      }),
    }
  )
);
