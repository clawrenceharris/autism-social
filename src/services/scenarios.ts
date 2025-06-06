import { DatabaseService } from "./database";
import type { Scenario, CreateScenarioData } from "../types";

export async function createScenario(data: CreateScenarioData) {
  const result = await DatabaseService.create<Scenario>("scenarios", {
    id: "",
    ...data,
  });
  if (result.error || !result.data) throw result.error;
  return result.data;
}

export async function getScenarioById(id: string) {
  const result = await DatabaseService.getSingle<Scenario>("scenarios", id);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Scenario not found with id: ${id}`);
  return result.data;
}

export async function getScenarios() {
  const result = await DatabaseService.get<Scenario>("scenarios");
  if (result.error) throw result.error;
  return result.data;
}

export async function updateScenario(id: string, data: Partial<Scenario>) {
  const result = await DatabaseService.update<Scenario>("scenarios", id, data);
  if (result.error) throw result.error;
  if (!result.data) throw new Error(`Scenario not found with id: ${id}`);
  return result.data;
}

export async function deleteScenario(id: string) {
  const result = await DatabaseService.delete("scenarios", id);
  if (result.error) throw result.error;
  return true;
}
