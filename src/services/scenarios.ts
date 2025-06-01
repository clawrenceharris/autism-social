import { DatabaseService } from './database';
import type { Scenario, Dialogue } from '../types';

export interface CreateScenarioData {
  title: string;
  description: string;
}

export interface CreateDialogueData {
  scenario_id: string;
  title: string;
  persona_tags: string[];
  user_fields: string[];
  steps: any[];
  scoring_categories: string[];
}

export async function createScenario(data: CreateScenarioData) {
  const result = await DatabaseService.create<Scenario>('scenarios', data);
  if (result.error) throw result.error;
  return result.data;
}

export async function createDialogue(data: CreateDialogueData) {
  const result = await DatabaseService.create<Dialogue>('dialogues', data);
  if (result.error) throw result.error;
  return result.data;
}

export async function getScenarios() {
  const result = await DatabaseService.get<Scenario>('scenarios');
  if (result.error) throw result.error;
  return result.data;
}

export async function getDialogues(scenarioId: string) {
  const result = await DatabaseService.get<Dialogue>('dialogues', {
    foreignKey: 'scenario_id',
    foreignValue: scenarioId,
  });
  if (result.error) throw result.error;
  return result.data;
}

export async function updateScenario(id: string, data: Partial<Scenario>) {
  const result = await DatabaseService.update<Scenario>('scenarios', id, data);
  if (result.error) throw result.error;
  return result.data;
}

export async function updateDialogue(id: string, data: Partial<Dialogue>) {
  const result = await DatabaseService.update<Dialogue>('dialogues', id, data);
  if (result.error) throw result.error;
  return result.data;
}

export async function deleteScenario(id: string) {
  const result = await DatabaseService.delete('scenarios', id);
  if (result.error) throw result.error;
  return true;
}

export async function deleteDialogue(id: string) {
  const result = await DatabaseService.delete('dialogues', id);
  if (result.error) throw result.error;
  return true;
}