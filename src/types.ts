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
  id?: string;
  title: string;
  description: string;
  created_at?: string;
}

export interface Dialogue {
  id?: string;
  scenario_id: string;
  title: string;
  persona_tags: string[];
  user_fields: string[];
  steps: Step[];
  scoring_categories: string[];
  created_at?: string;
}