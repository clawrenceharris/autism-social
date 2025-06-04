import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
const generateAIResponse = async (prompt: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedContent = response.text();
    return generatedContent;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};
export const generateSuggestedDialogues = async (
  scenarioTitle: string
): Promise<string> => {
  const prompt = `Generate 4-5 possible titles for dialogue sequence that could be categorized by the scenario titled "${scenarioTitle}"
       
      Constraints:
      
        -Separate each title by a comma with no space.
    `;
  try {
    return await generateAIResponse(prompt);
  } catch (error) {
    throw error;
  }
};

export async function generateScenarioSteps(
  category: string,
  variationTitle: string,
  difficulty: string,
  personaTags: string[]
): Promise<object> {
  const prompt = `

  Create a social scenario dialogue for the category "${category}" with variation "${variationTitle}". This is for an autistic user practicing social interaction.

  The output should be a valid JSON array of 3–7 dialogue steps. Generate dialogue steps that aim to challenge autistic users based on ${difficulty} difficulty level.

  Each step must include:

  - id: a unique string in lowercase kebab-case (e.g., "greeting", "ask-name"). It must match one of the target \`next\` values from another step's options.
  - npc: a short sentence of what the non-player character (NPC) says at this step.
  - options: an array of 3–4 choices the user can select from. Each option must include:
    - label: what the user might say (realistic and breif). 
    - event: "CHOOSE_1", "CHOOSE_2", "CHOOSE_3", "CHOOSE_4" etc. Use each only once per step.
    - next: the \`id\` to go to when this option is chosen. This must exactly match one of the existing \`id\` values in the overall array (no orphaned or missing steps).
    - scoreChanges: an object with any combination of the following keys (clarity, empathy, assertiveness, selfAdvocacy, socialAwareness), each assigned either 0 (no credit) or 1 (full credit).

  Constraints:
  - The npc's responses should match the following persona: ${personaTags.join(
    ", "
  )}
  - The first step must have id: "start"
  - The final step(s) must have an empty array for \`options\` to indicate the end of the scenario.
  - All \`next\` values must reference valid \`id\`s from this array — do not invent steps that aren't included.

  Return only the JSON array. Do not include explanations, comments, or formatting outside of the array.`;
  const generatedContent = await generateAIResponse(prompt);
  const jsonMatch = generatedContent.match(/\[.*\]/s);
  if (!jsonMatch) throw new Error("No valid JSON found in response");

  const parsedSteps = JSON.parse(jsonMatch[0]);
  return parsedSteps.map((step: any) => ({
    ...step,
    options: step.options.map((option: any) => ({
      ...option,
      scoreChanges: option.scoreChanges || {},
    })),
  }));
}