import { assign, createMachine } from "xstate";
import type {
  DialogueEvent,
  DialogueStep,
  ScoreCategory,
  ScoreSummary,
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
        actions: opt.scoring
          ? assign(({ context }: { context: ScoreSummary }) => {
              const updated = { ...context };

              for (const cat of categories) {
                if (opt.scoring[cat]) {
                  updated[cat] = updated[cat]
                    ? updated[cat] + opt.scoring[cat]
                    : opt.scoring[cat];
                  console.log(updated);
                }
              }

              return updated;
            })
          : undefined,
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
      context: {} as ScoreSummary,
    },
    context: {},
    id,
    initial: steps[0].id,

    states: stateConfig,
  });
}
