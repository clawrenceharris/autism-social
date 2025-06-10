import { assign, createMachine } from "xstate";
import type { DialogueEvent, DialogueStep } from "../types";

export interface DialogueContext {
  clarity: number;
  empathy: number;
  assertiveness: number;
  selfAdvocacy: number;
  socialAwareness: number;
}

export function createDialogueMachine(
  id: string,

  steps: DialogueStep[],
  finalState = "end"
) {
  const stateConfig: Record<string, object> = {};

  for (const step of steps) {
    const transitions: Record<string, object> = {};

    for (const opt of step.options) {
      transitions[opt.event] = {
        target: opt.next,
        actions: opt.scores
          ? assign(({ context }) => {
              const updated = { ...context };
              opt.scores.forEach((key) => {
                updated[key] += 1;
                console.log("Value: " + key);
              });
            console.log(updated);
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
      context: {clarity: 0} as DialogueContext
    },
    id,
    initial: steps[0].id,

    states: stateConfig,
  });
}
