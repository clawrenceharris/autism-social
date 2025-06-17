import type {
  UserProgress,
  CreateDialogueData,
  Dialogue,
  ScoreSummary,
} from "../types";
import { DatabaseService } from "./database";

export interface DialoguePossibleScores {
  clarity?: number;
  empathy?: number;
  assertiveness?: number;
  socialAwareness?: number;
  selfAdvocacy?: number;
}

export interface ProgressPercentages {
  clarity: number;
  empathy: number;
  assertiveness: number;
  social_awareness: number;
  self_advocacy: number;
  overall: number;
  user_completed_dialogues: number;
  total_dialogues: number;
}

export async function deleteDialogue(id: string) {
  const result = await DatabaseService.delete("dialogues", id);
  if (result.error) throw result.error;
  return true;
}

export async function createDialogue(data: CreateDialogueData) {
  const result = await DatabaseService.create<Dialogue>(
    "dialogues",
    data as Dialogue
  );
  if (result.error || !result.data) throw result.error;
  return result.data;
}

export async function updateDialogue(id: string, updates: Partial<Dialogue>) {
  const { data, error } = await DatabaseService.update<Dialogue>(
    "dialogues",
    id,
    updates
  );
  if (error) throw error;
  return data;
}

export async function getDialogues() {
  const { data, error } = await DatabaseService.get<Dialogue>("dialogues");
  if (error) throw error;
  return data;
}

export async function getCompletedDialogues(userId: string) {
  const { data, error } = await DatabaseService.get<Dialogue>(
    "user_completed_dialogues",
    {
      foreignKey: "user_id",
      foreignValue: userId,
    }
  );
  if (error) throw error;
  return data;
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
  const { data, error } = await DatabaseService.getSingle<Dialogue>(
    "dialogues",
    id
  );
  if (error) throw error;
  return data;
}

export async function addDialogueProgress(
  userId: string,
  dialogueId: string,
  scores: ScoreSummary
) {
  const { data, error } = await DatabaseService.create<UserProgress>(
    "user_progress",
    {
      user_id: userId,
      dialogue_id: dialogueId,
      assertiveness: null,
      clarity: null,
      self_advocacy: null,
      social_awareness: null,
      empathy: null,
      ...scores,
    }
  );
  if (error) throw error;
  return data;
}
export async function updateDialogueProgress(
  userId: string,
  dialogueId: string,
  scores: ScoreSummary
) {
  const { data, error } = await DatabaseService.updateBy<UserProgress>(
    "user_progress",
    "dialogue_id",
    dialogueId,
    {
      user_id: userId,
      dialogue_id: dialogueId,
      ...scores,
    }
  );
  if (error) throw error;
  return data;
}
