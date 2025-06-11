import type { Dialogue, Difficulty, ScoreCategory } from "./types";
import type { DialogueContext } from "./xstate/createDialogueMachine";
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export const getScoreCategoryTotal = (
  category: ScoreCategory,
  dialogue: Dialogue
) => {
  if (!dialogue) {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < dialogue.steps.length; i++) {
    for (let j = 0; j < dialogue.steps[i].options.length; j++) {
      if (dialogue.steps[i].options[j].scores.includes(category)) {
        count++;
        break;
        
      }
    }
  }
  return count;
};

const calcDialogueScore = (
  category: keyof DialogueContext & ScoreCategory,
  dialogue: Dialogue,
  context: DialogueContext
) => {
  const total =  getScoreCategoryTotal(category, dialogue);
  if (
    context[category] === undefined && total > 0) {
    return 0;
  } else if (!context[category]) {
    return undefined;
  }
  return context[category];
};

export const getDialogueScores = (
  context: DialogueContext,
  dialogue: Dialogue
) => {
  const clarity = calcDialogueScore("clarity", dialogue, context);
  const empathy = calcDialogueScore("empathy", dialogue, context);
  const assertiveness = calcDialogueScore("assertiveness", dialogue, context);
  const socialAwareness = calcDialogueScore(
    "socialAwareness",
    dialogue,
    context
  );

  const selfAdvocacy = calcDialogueScore("selfAdvocacy", dialogue, context);
  const difficulty = dialogue.difficulty;
  return {
    clarity: clarity  ?? undefined,
    empathy: empathy ?? undefined,
    assertiveness: assertiveness ?? undefined,
    socialAwareness: socialAwareness ?? undefined,
    selfAdvocacy: selfAdvocacy ?? undefined,
  };
};
