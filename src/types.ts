import type { User } from "@supabase/supabase-js";
import type { ReactElement } from "react";
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
  age: number | null;
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
  scoring: ScoreSummary;
  max_scoring: ScoreSummary;
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
  bio: string;
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
  isBest: boolean;
  nextStepId: string;
  scoring: { [key: string]: number };
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
}

export interface Dialogue {
  id: string;
  max_scoring: ScoreSummary;
  actor_id: string;
  scenario_id: string;
  title: string;
  persona_tags: string[];
  introduction: string;
  placeholders: string[];
  steps: DialogueStep[];
  difficulty: Difficulty;
  scoring_categories: string[];
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
  role: string;
}
export interface Message {
  id: string;
  speaker: "npc" | "user";
  text: string;
}

export interface UserMessage extends Message {
  scoring: Record<ScoreCategory, number>;
}

// Streak tracking types
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completion_date: string | null; // ISO date string (YYYY-MM-DD)
  last_completion_timezone: string;
  created_at: string;
  updated_at: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // ISO date string (YYYY-MM-DD)
  lastCompletionTimezone: string;
}

export interface StreakUpdateResult {
  success: boolean;
  streakData: StreakData;
  streakIncremented: boolean;
  streakReset: boolean;
  message?: string;
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
