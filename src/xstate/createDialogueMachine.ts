import { assign, createMachine } from "xstate";
import type {
  DialogueEvent,
  DialogueStep,
  ScoreCategory,
  ScoreSummary,
  DialoguePossibleScores,
} from "../types";

export function createDialogueMachine(
  id: string,
  steps: DialogueStep[],
  totalPossibleScores: DialoguePossibleScores,
  finalState = "end"
) {
  const stateConfig: Record<string, object> = {};
  const categories: ScoreCategory[] = [
    "clarity",
    "empathy",
    "assertiveness",
    "socialAwareness",
    "selfAdvocacy",
  ];

  for (const step of steps) {
    const transitions: Record<string, object> = {};

    for (const opt of step.options) {
      transitions[opt.event] = {
        target: opt.next,
        actions: opt.scores
          ? assign(({ context }: { context: ScoreSummary }) => {
              const updated = { ...context };

              for (const cat of categories) {
                if (opt.scores[cat] !== undefined) {
                  updated[cat].earned += opt.scores[cat];
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
    context: Object.fromEntries(
      categories.map((c) => [
        c,
        {
          earned: 0,
          possible: totalPossibleScores[c] || 0,
        },
      ])
    ),

    id,
    initial: steps[0].id,

    states: stateConfig,
  });
}