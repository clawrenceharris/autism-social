import type { AnyStateMachine, StateSchema } from "xstate";

export interface Scenario {
  id: number;
  name: string;
}
export interface Dialogue {
  id: number;
  name: string;
  description: string;
  actor: Actor;
  machine: AnyStateMachine;
}
export interface Prompt {
  id: number;
  responses: Response[];
  difficulty: "easy" | "medium" | "hard" | "extra hard";
  text: string;
}

export interface Response {
  text: string;
  stars: 1 | 2 | 3;
}

export interface DialogueContext {
  clarity: number;
  empathy: number;
  assertiveness: number;
}

// 2. Define your event shape
export type DialogueEvent =
  | { type: string }
  | { type: "CHOOSE_OPTION"; value: string }
  | { type: "REPLAY" };

// 3. Define state schema (can be generic if you don’t need strict typing)
export interface DialogueStateSchema extends StateSchema {
  states: {
    start: {};
    response: {};
    end: {};
  };
}

export interface DialogueStep {
  id: string;
  npc: string;
  options: {
    label: string;
    event: string;
    scoreChanges?: Partial<DialogueContext>;
    next: string;
  }[];
}

export type MeetSomeoneEvent =
  | DialogueEvent
  | { type: "GREET" }
  | { type: "SILENT" };

export type AskForHelpEvent = DialogueEvent | { type: "REQUEST_HELP" };

export interface Actor {
  name: string;
}
