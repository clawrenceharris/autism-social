import type { CreateDialogueData, Dialogue } from "../types";
import { DatabaseService } from "./database";

export async function deleteDialogue(id: string) {
  const result = await DatabaseService.delete("dialogues", id);
  if (result.error) throw result.error;
  return true;
}

export async function createDialogue(data: CreateDialogueData) {
  const { actorName, ...rest } = data;

  const result = await DatabaseService.create<Dialogue>("dialogues", {
    id: "",
    actor: { name: actorName },
    ...rest,
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

export async function getDialogues() {
  const result = await DatabaseService.get<Dialogue>("dialogues");
  if (result.error) throw result.error;
  return result.data;
}

export async function getCompletedDialogues(userId: string) {
  const result = await DatabaseService.get<Dialogue>("completed_dialogues", {
    foreignKey: "user_id",
    foreignValue: userId,
  });
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
