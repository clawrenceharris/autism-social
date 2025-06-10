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

export const getScoreMultiplier = () => {
    let multiplier = 1;
    if (dialogue?.difficulty === "medium") {
      multiplier = 10;
    }
    if (dialogue?.difficulty === "hard") {
      multiplier = 20;
    }
    if (dialogue?.difficulty === "extra hard") {
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
  
export const getDialogueScores = (context: DialogueContext) => {
    const clarity = calcDialogueScore(context, "clarity");
    const empathy = calcDialogueScore(context, "empathy");
    const assertiveness = calcDialogueScore(context, "assertiveness");
    const socialAwareness = calcDialogueScore(context, "socialAwareness");

    const selfAdvocacy = calcDialogueScore(context, "selfAdvocacy");

    return {
      clarity: clarity ? clarity * getScoreMultiplier() : undefined,
      empathy: empathy ? empathy * getScoreMultiplier() : undefined,
      assertiveness: assertiveness
        ? assertiveness * getScoreMultiplier()
        : undefined,
      socialAwareness: socialAwareness
        ? socialAwareness * getScoreMultiplier()
        : undefined,
      selfAdvocacy: selfAdvocacy ? selfAdvocacy * getScoreMultiplier() : undefined,
    };
  };
