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
  id: string;
  name: string;
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
export const updateScoringEvents = async ({
  userId,
  dialogueId,
  stepId,
  scores,
}: {
  userId: string;
  dialogueId: string;
  stepId: string;
  scores: Record<ScoreCategory, number>;
}) => {
  const inserts = Object.entries(scores).map(([categoryName, score]) => ({
    user_id: userId,
    dialogue_id: dialogueId,
    step_id: stepId,
    score,
    max_score: score,
    category_name: categoryName,
  }));

  for (const entry of inserts) {
    const category = await getCategoryByName(
      entry.category_name as ScoreCategory
    );
    if (!category) continue;

    const { error } = await DatabaseService.create<CreateCategoryScoringEvent>(
      "dialogue_scoring_events",
      {
        user_id: entry.user_id,
        dialogue_id: entry.dialogue_id,
        step_id: entry.step_id,
        category_id: category.id,
        score: entry.score,
        max_score: entry.max_score,
      }
    );

    if (error) {
      console.error("Failed to insert scoring event", error);
    }
  }
};
