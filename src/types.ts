export interface Option {
  responseLabel: string;
  eventType: string;
  nextStepId: string;
  scores: { [key: string]: number };
}

export interface Step {
  stepId: string;
  npcLine: string;
  options: Option[];
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
  user_fields: string[];
  steps: Step[];
  scoring_categories: string[];
  created_at?: string;
}

export interface DialogueContext {
  clarity: number;
  empathy: number;
  assertiveness: number;
  selfAdvocacy: number;
  socialAwareness: number;
}

export interface DialogueStep {
  id: string;
  npc: string;
  options: DialogueOption[];
}
export interface DialogueOption {
  label: string;
  event: string;
  scoreChanges?: Partial<DialogueContext>;
  next: string;
}
