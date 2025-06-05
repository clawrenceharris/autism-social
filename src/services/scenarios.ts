import { DatabaseService } from "./database";
import type {
  Scenario,
  Dialogue,
  CreateScenarioData,
  CreateDialogueData,
} from "../types";
import { supabase } from "../lib/supabase";

export async function createScenario(data: CreateScenarioData) {
  const result = await DatabaseService.create<Partial<Scenario>>("scenarios", data);
  if (result.error) throw result.error;
  return result.data;
}

export async function createDialogue(data: CreateDialogueData) {
  const result = await DatabaseService.create<Partial<Dialogue>>("dialogues", data);
  if (result.error) throw result.error;
  return result.data;
}

export async function getScenarioById(id: string) {
  const result = await DatabaseService.getSingle<Scenario>("scenarios", id);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Scenario not found with id: ${id}`);
  return result.data;
}

export async function getDialogueById(id: string) {
  const result = await DatabaseService.getSingle<Dialogue>("dialogues", id);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Dialogue not found with id: ${id}`);
  return result.data;
}

export async function getScenarios() {
  const result = await DatabaseService.get<Scenario>("scenarios");
  if (result.error) throw result.error;
  return result.data;
}

export async function getDialogues(scenarioId: string) {
  const result = await DatabaseService.get<Dialogue>("dialogues", {
    foreignKey: "scenario_id",
    foreignValue: scenarioId,
  });
  if (result.error) throw result.error;
  return result.data;
}

export async function getAllDialogues() {
  const result = await DatabaseService.get<Dialogue>("dialogues");
  if (result.error) throw result.error;
  return result.data;
}

export async function updateScenario(id: string, data: Partial<Scenario>) {
  const result = await DatabaseService.update<Scenario>("scenarios", id, data);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Scenario not found with id: ${id}`);
  return result.data;
}

export async function updateDialogue(id: string, data: Partial<Dialogue>) {
  const result = await DatabaseService.update<Dialogue>("dialogues", id, data);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Dialogue not found with id: ${id}`);
  return result.data;
}

export async function deleteScenario(id: string) {
  const result = await DatabaseService.delete("scenarios", id);
  if (result.error) throw result.error;
  return true;
}

export async function deleteDialogue(id: string) {
  const result = await DatabaseService.delete("dialogues", id);
  if (result.error) throw result.error;
  return true;
}