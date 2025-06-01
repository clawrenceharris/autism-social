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
  description: string;
  title: string;
  variationId: string;
  variationTitle: string;
  difficulty: "easy" | "medium" | "hard" | "extra hard";
  scoringCategories: string[];
  steps: Step[];
  personaTags: string[];
  userFields: string[];
}
