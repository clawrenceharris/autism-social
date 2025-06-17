import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCategories, type Category } from "../services/scoring_categories";

interface ScoreCategoryStore {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  error: string | null;
  loading: boolean;
}

export const useScoreCategoryStore = create<ScoreCategoryStore>()(
  persist(
    (set) => ({
      categories: [],
      loading: false,
      error: null,
      fetchCategories: async () => {
        try {
          set({ loading: true, error: null });
          const categories = (await getCategories()) || [];
          set({ categories });
        } catch {
          set({ error: "Could not load categories" });
        } finally {
          set({
            loading: false,
          });
        }
      },
    }),
    {
      name: "categories-storage",
      partialize: (state) => ({
        categories: state.categories,
      }),
    }
  )
);
