import type { User } from "@supabase/supabase-js";
import type { FieldValues } from "react-hook-form";

export interface UserPreferences {
  goalIds: string[];
  interestIds: string[];
  goals: Array<{ id: string; goal: string }>;
  interests: Array<{ id: string; name: string }>;
}

export interface ScenarioLinkage {
  scenario: Scenario;
  goalIds: string[];
  interestIds: string[];
  goalNames: string[];
  interestNames: string[];
}

export interface RecommendationOptions {
  limit?: number;
  excludeCompletedIds?: string[];
  minMatchScore?: number;
}

export interface SignUpFormValues extends FieldValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  goals: string[];
  interests: string[];
  agreement: boolean;
}

export interface AuthContextType {
  profile: UserProfile;
  user: User;
}

export interface Interest {
  id: string;
  name: string;
}
export interface ScenarioWithDialogues extends Scenario {
  isCompleted: boolean;
  isTrending: boolean;
  isRecommended: boolean;
  lastPlayed?: string;
  dialogues: Dialogue[];
  completedCount: number;
}

export interface UserProgress {
  user_id: string;
  dialogue_id: string;
  clarity: number;
  empathy: number;
  assertiveness: number;
  social_awareness: number;
  self_advocacy: number;
}

export interface Goal {
  id: string;
  goal: string;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  day_of_week: number;
  dialogue_id: string;
  week_start_date: string;
  is_active: boolean;
  created_at?: string;
  dialogue?: Dialogue;
}

export interface Option {
  responseLabel: string;
  eventType: string;
  nextStepId: string;
  scores: { [key: string]: number };
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
}

export interface Dialogue {
  id: string;

  actor_id: string;
  scenario_id: string;
  title: string;
  persona_tags: string[];
  introduction: string;
  placeholders: string[];
  steps: DialogueStep[];
  difficulty: Difficulty;
  scoring_categories: string[];
  total_possible_scores: Record<ScoreCategory, number>;
  created_at?: string;
  lastPlayed?: string;
}

export interface DialogueStep {
  id: string;
  npc: string;
  options: DialogueOption[];
}

export type ScoreCategory =
  | "clarity"
  | "empathy"
  | "assertiveness"
  | "social_awareness"
  | "self_advocacy";

export type Difficulty = "easy" | "medium" | "hard" | "extra hard";

export interface CreateScenarioData {
  title: string;
  description: string;
}

export interface ScoreSummary {
  clarity: number;
  empathy: number;
  assertiveness: number;
  social_awareness: number;
  self_advocacy: number;
}

export interface CreateDialogueData {
  scenario_id: string;
  title: string;
  actor_id: string;
  persona_tags: string[];
  placeholders: string[];
  steps: DialogueStep[];
  difficulty: Difficulty;
  scoring_categories: string[];
  total_possible_scores: Record<ScoreCategory, number>;
}

export type DialogueEvent = { type: string };

export interface DialogueStep {
  id: string;
  npc: string;
  options: DialogueOption[];
}

export interface DialogueOption {
  label: string;
  event: string;
  maxScoring: Record<ScoreCategory, number>;
  scoring: Record<ScoreCategory, number>;
  next: string;
}

export interface Actor {
  id: string;
  first_name: string;
  last_name: string;
  voice_id: string;
  bio: string;
}

export interface Message {
  id: string;
  speaker: "npc" | "user";
  text: string;
}
