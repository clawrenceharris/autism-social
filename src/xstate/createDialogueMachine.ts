import { assign, createMachine } from "xstate";
import type {
  DialogueContext,
  DialogueEvent,
  DialogueStep,
  ScoreCategory,
} from "../types";

export function createDialogueMachine(
  id: string,
  steps: DialogueStep[],
  finalState = "end"
) {
  const stateConfig: Record<string, object> = {};
  const categories: ScoreCategory[] = [
    "clarity",
    "empathy",
    "assertiveness",
    "social_awareness",
    "self_advocacy",
  ];

  for (const step of steps) {
    const transitions: Record<string, object> = {};

    for (const opt of step.options) {
      transitions[opt.event] = {
        target: opt.next,
        actions: assign(({ context }: { context: DialogueContext }) => {
          const updated = { ...context };
          updated.path.push(opt);
          for (const cat of categories) {
            if (opt.scoring[cat] !== undefined) {
              updated.scores[cat] = updated.scores[cat]
                ? updated.scores[cat] + opt.scoring[cat]
                : opt.scoring[cat];
            }
          }

          return updated;
        }),
      };
    }

    stateConfig[step.id] = {
      tags: {
        npc: step.npc,
        options: [...step.options],
      },

      ...(step.options.length > 0
        ? {
            on: transitions,
            meta: { npc: step.npc, options: step.options },
          }
        : {
            always: finalState,
            meta: { npc: step.npc, options: [] },
          }),
    };
  }

  stateConfig[finalState] = { type: "final" };

  return createMachine({
    types: {
      events: {} as DialogueEvent,
      context: {} as DialogueContext,
    },
    context: {
      path: [],
      scores: {},
    },
    id,
    initial: steps[0].id,

    states: stateConfig,
  });
}
