import {
  createMachine,
  assign,
  SingleOrArray,
  type StateMachine,
} from "xstate";
import { DialogueContext, DialogueEvent, DialogueStep } from "../types";

export function createDialogueMachine(
  id: string,

  steps: DialogueStep[],
  finalState = "end"
) {
  const stateConfig: any = {};

  for (const step of steps) {
    const transitions: Record<string, any> = {};

    for (const opt of step.options) {
      transitions[opt.event] = {
        target: opt.next,
        actions: opt.scoreChanges
          ? assign(({ context }) => {
              const updated = { ...context };
              Object.entries(opt.scoreChanges!).forEach(([key, value]) => {
                updated[key] = (updated[key] || 0) + value;
              });
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
      context: {} as DialogueContext,
      events: {} as DialogueEvent,
    },
    id,
    initial: steps[0].id,
    context: {
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      socialAwareness: 0,
      selfAdvocacy: 0,
    },

    states: stateConfig,

    on: {
      REPLAY: {
        target: `.${steps[0].id}`,
        actions: assign({
          clarity: () => 0,
          empathy: () => 0,
          assertiveness: () => 0,
        }),
      },
    },
  });
}
