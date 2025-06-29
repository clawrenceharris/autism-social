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

export async function getDialoguesByScenarioId(scenarioId: string) {
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

export async function completeDialogue({
  dialogueId,
  scoring,
  userId
}: {
  userId: string;
  dialogueId: string;
  scoring: ScoreSummary;
}) {
  const { data, error } = await supabase.rpc(
    "complete_dialogue",
      userId,
      dialogueId,
      scoring
  );
  if (error) throw error;
  return data;
}