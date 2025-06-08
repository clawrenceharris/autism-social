import { supabase } from "../lib/supabase";
import type { CreateDialogueData, Dialogue } from "../types";
import { DatabaseService } from "./database";

export async function deleteDialogue(id: string) {
  const result = await DatabaseService.delete("dialogues", id);
  if (result.error) throw result.error;
  return true;
}

export async function createDialogue(data: CreateDialogueData) {
  const result = await DatabaseService.create<Dialogue>("dialogues", {
    id: "",
    ...data,
  });
  if (result.error || !result.data) throw result.error;
  return result.data;
}

export async function updateDialogue(id: string, data: Partial<Dialogue>) {
  const result = await DatabaseService.update<Dialogue>("dialogues", id, data);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Dialogue not found with id: ${id}`);
  return result.data;
}

export async function getAllDialogues() {
  const result = await DatabaseService.get<Dialogue>("dialogues");
  if (result.error) throw result.error;
  return result.data;
}

export async function getScenarioDialogues(scenarioId: string) {
  const result = await DatabaseService.get<Dialogue>("dialogues", {
    foreignKey: "scenario_id",
    foreignValue: scenarioId,
  });
  if (result.error) throw result.error;
  return result.data;
}

export async function getDialogueById(id: string) {
  const result = await DatabaseService.getSingle<Dialogue>("dialogues", id);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Dialogue not found with id: ${id}`);
  return result.data;
}

export async function getRecommendedDialogues(
  userId: string
): Promise<Dialogue[]> {
  const { data, error } = await supabase.rpc("get_recommended_dialogues", {
    user_uuid: userId,
  });

  if (error) throw error;
  return data as Dialogue[];
}
