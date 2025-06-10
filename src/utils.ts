import type {Difficulty} from "./types"
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}


export const getScoreCategoryCount = (category: ScoreCategory) => {
    if (!dialogue) {
      return 0;
    }
    let count = 0;
    for (let i = 0; i < dialogue.steps.length; i++) {
      for (let j = 0; j < dialogue.steps[i].options.length; j++) {
        if (dialogue.steps[i].options[j].scores.includes(category)) {
          count++;
        }
      }
    }
    return count;
  };

export const getScoreMultiplier = (difficulty: Difficulty) => {
    let multiplier = 1;
    if (difficulty === "medium") {
      multiplier = 10;
    }
    if (difficulty === "hard") {
      multiplier = 20;
    }
    if (difficulty === "extra hard") {
      multiplier = 30;
    }
    return multiplier;
  };
  const calcDialogueScore = (
    context: DialogueContext,
    category: keyof DialogueContext & ScoreCategory
  ) => {
    if (context[category] === undefined && getScoreCategoryCount(category) > 0) {
      return 0;
    } else if (!context[category]) {
      return undefined;
    }
    return context[category];
  };
  
export const getDialogueScores = (context: DialogueContext, dialogue: Dialogue ) => {
    const clarity = calcDialogueScore(context, "clarity");
    const empathy = calcDialogueScore(context, "empathy");
    const assertiveness = calcDialogueScore(context, "assertiveness");
    const socialAwareness = calcDialogueScore(context, "socialAwareness");

    const selfAdvocacy = calcDialogueScore(context, "selfAdvocacy");
    const difficulty = dialogue.difficulty
    return {
      clarity: clarity ? clarity * getScoreMultiplier(difficulty) : undefined,
      empathy: empathy ? empathy * getScoreMultiplier(difficulty) : undefined,
      assertiveness: assertiveness
        ? assertiveness * getScoreMultiplier(difficulty)
        : undefined,
      socialAwareness: socialAwareness
        ? socialAwareness * getScoreMultiplier()
        : undefined,
      selfAdvocacy: selfAdvocacy ? selfAdvocacy * getScoreMultiplier(difficulty) : undefined,
    };
  };
