import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Step } from "./types";

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

export async function generateScenarioSteps(
  category: string,
  variationTitle: string,
  userFields: string[],
  difficulty: string,
  personaTags: string[]
): Promise<Step[]> {
  const prompt = `

  Create a social scenario dialogue for the category "${category}" with variation "${variationTitle}". This is for an autistic user practicing social interaction.

  The output should be a valid JSON array of 3–6 dialogue steps. Generate dialogue steps based on ${difficulty} difficulty level.

  Each step must include:

  - stepId: a unique string in lowercase kebab-case (e.g., "greeting", "ask-major"). It must match one of the target \`nextStepId\` values from another step’s options.
  - npcLine: a short sentence of what the non-player character (NPC) says at this step.
  - options: an array of 3–4 choices the user can select from. Each option must include:
    - responseLabel: what the user might say (realistic and breif). 
    - eventType: "CHOOSE_1", "CHOOSE_2", "CHOOSE_3", etc. Use each only once per step.
    - nextStepId: the \`stepId\` to go to when this option is chosen. This must exactly match one of the existing stepId values in the overall array (no orphaned or missing steps).
    - scoreChanges: an object with any combination of the following keys (clarity, empathy, assertiveness, selfAdvocacy, socialAwareness), each assigned either 0 (no credit) or 1 (full credit).

  Constraints:
  - The npc's responses should match the following persona: ${personaTags.join(
    ", "
  )}
  -  Use only the following dynamic user fields when inserting \`{{user.field}}\`: ${userFields
    .map((f) => `{{user.${f}}}`)
    .join(", ")}
  - The first step must have stepId: "start"
  - The final step(s) must have an empty array for \`options\` to indicate the end of the scenario.
  - All \`nextStepId\` values must reference valid \`stepId\`s from this array — do not invent steps that aren't included.

  Return only the JSON array. Do not include explanations, comments, or formatting outside of the array.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedContent = response.text();

    const jsonMatch = generatedContent.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error("No valid JSON found in response");

    const parsedSteps = JSON.parse(jsonMatch[0]);
    return parsedSteps.map((step: any) => ({
      ...step,
      stepId: generateId("step"),
      options: step.options.map((option: any) => ({
        ...option,
        scoreChanges: option.scoreChanges || {},
      })),
    }));
  } catch (error) {
    console.error("Error generating steps:", error);
    throw error;
  }
}
