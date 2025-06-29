import type { ScoreCategory } from "../types";
import { DatabaseService } from "./database";

export interface CreateCategoryScoringEvent {
  step_id: string;
  user_id: string;
  dialogue_id: string;
  category_id: string;
  score: number;
  max_score: number;
}

export interface Category {
  id?: string;
  name: ScoreCategory;
  description?: string;
}
export const getCategoryByName = async (name: ScoreCategory) => {
  const { data, error } = await DatabaseService.getSingleBy<Category>(
    "scoring_categories",
    "name",
    name
  );
  if (error) throw error;

  return data;
};

export const getCategories = async () => {
  const { data, error } = await DatabaseService.get<Category>(
    "scoring_categories"
  );
  if (error) throw error;

  return data;
};
