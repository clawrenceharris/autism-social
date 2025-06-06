export interface CreateScenarioData {
  title: string;
  description: string;
}

export interface CreateDialogueData {
  scenario_id: string;
  title: string;
  steps: DialogueStep[];
  placeholders: string[];
  persona_tags: string[];
  scoring_categories: string[];
  difficulty: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  goal: string;
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
  scenario_id: string;
  title: string;
  persona_tags: string[];
  placeholders: string[];
  steps: DialogueStep[];
  difficulty: string;
  scoring_categories: string[];
  created_at?: string;
}

export interface DialogueStep {
  id: string;
  npc: string;
  options: DialogueOption[];
}
export interface DialogueOption {
  label: string;
  event: string;
  scoreChanges: ScoreCategory[];
  next: string;
}
export type ScoreCategory =
  | "clarity"
  | "empathy"
  | "assertiveness"
  | "socialAwareness"
  | "selfAdvocacy";
