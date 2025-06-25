import { OpenAI } from "openai";
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  project: import.meta.env.VITE_OPENAI_PROJECT_ID,
  dangerouslyAllowBrowser: true,
});
