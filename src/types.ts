import type { ReactElement } from "react";
import type { FieldValues } from "react-hook-form";

export interface SignUpFormValues extends FieldValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  goals: string[];
  interests: string[];
  agreement: boolean;
  age: number | null;
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
  scoring: ScoreSummary;
  completed_at?: string;
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
  age: number | null;

  bio: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
}

export interface Dialogue {
  form_helper?: string;
  context: string;
  id: string;
  tags: string[];
  setting: string;
  actor_id: string;
  scenario_id: string;
  title: string;
  description: string;
  placeholders: string[];
  difficulty: Difficulty;
  scoring_categories: string[];
  created_at?: string;
  lastPlayed?: string;
  published?: boolean;
}

export type ScoreCategory =
  | "clarity"
  | "empathy"
  | "assertiveness"
  | "social_awareness"
  | "self_advocacy"
  | "engagement";

export type Difficulty = "easy" | "medium" | "hard" | "extra hard";

export interface CreateScenarioData {
  title: string;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "milestone" | "skill" | "streak" | "mastery";
  earned: boolean;
  earnedDate?: string;
}

export interface ScoreSummary {
  clarity?: number;
  empathy?: number;
  assertiveness?: number;
  social_awareness?: number;
  self_advocacy?: number;
  engagement?: number;
}

export interface CreateDialogueData {
  scenario_id: string;
  title: string;
  actor_id: string;
  placeholders: string[];
  difficulty: Difficulty;
  scoring_categories: string[];
}

export interface Actor {
  id: string;
  persona_tags: string[];
  first_name: string;
  last_name: string;
  voice_id: string;
  bio: string;
  role: string;
}

// User Ranking System
export interface UserRank {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  icon: ReactElement;
  color: string;
}

export interface RankProgress {
  currentRank: UserRank;
  nextRank: UserRank | null;
  currentPoints: number;
  pointsForNextRank: number;
  pointsInCurrentRank: number;
  percentToNextRank: number;
  remainingPoints: number;
}