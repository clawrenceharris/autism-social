import type { Response } from "openai/resources/responses/responses.mjs";
import type useOpenAI from "../hooks/useOpenAI";
import type { ScoreSummary } from "../types";
import type { DialogueContext } from "../xstate/createDialogueMachine";

export interface ConversationMessage {
  id: string;
  speaker: "user" | "actor";
  content: string;
  scores?: ScoreSummary;
  phase: DialoguePhase;
}

export type DialoguePhase =
  | "introduction"
  | "main_topic"
  | "wrap_up"
  | "completed";

export interface ActorResponse {
  content: string;
  userResponseOptions: string[];
  nextPhase?: DialoguePhase;
  contextUsed?: string[];
}

export interface UserResponseAnalysis {
  scores: ScoreSummary;
  feedback: string;
  betterResponse?: string;
}

/**
 * Service for managing dynamic dialogue interactions with AI-generated responses
 */
export class DialogueService {
  private openai: ReturnType<typeof useOpenAI>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private history: any[] = [];
  constructor(openai: ReturnType<typeof useOpenAI>) {
    this.openai = openai;
  }
  async initializeDialogue(context: DialogueContext): Promise<ActorResponse> {
    const prompt = this.buildActorPrompt(context);
    this.history.push({
      role: "user",
      content: `User Info: ${Object.entries(context.userFields).map(
        ([key, value]) => `${key.replace("_", " ")}: ${value}`
      )}`,
    });
    const response = await this.openai.generateText({
      store: true,
      instructions: prompt,
      input: this.history,
    });
    this.history = [
      ...this.history,
      ...response.output.map((el) => {
        delete el.id;
        return el;
      }),
    ];
    return this.parseActorResponse(response, context);
  }
  /**
   * Generate actor response based on context and conversation history
   */
  async generateActorResponse(
    context: DialogueContext
  ): Promise<ActorResponse> {
    const prompt = this.buildActorPrompt(context);
    const { currentUserInput } = context;
    this.history.push({
      role: "user",
      content: currentUserInput || "Waiting for your response",
    });
    try {
      const response = await this.openai.generateText({
        instructions: prompt,
        store: true,
        input: this.history,
      });
      this.history = [
        ...this.history,
        ...response.output.map((el) => {
          delete el.id;
          return el;
        }),
      ];
      console.log(this.parseActorResponse(response, context));
      return this.parseActorResponse(response, context);
    } catch (error) {
      console.error("Error generating actor response:", error);
      return this.getFallbackActorResponse(context);
    }
  }

  /**
   * Analyze user's free-form response and provide scoring
   */
  async analyzeUserResponse(
    userInput: string,
    context: DialogueContext
  ): Promise<UserResponseAnalysis> {
    const prompt = this.buildAnalysisPrompt(userInput, context);

    try {
      const response = await this.openai.generateText({
        input: [{ role: "system", content: prompt }],
      });
      return this.parseUserAnalysis(response.output_text);
    } catch (error) {
      console.error("Error analyzing user response:", error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Build prompt for actor response generation
   */
  private buildActorPrompt(context: DialogueContext): string {
    const { userFields, actor, currentPhase, dialogue } = context;

    const renderTemplate = (template: string): string => {
      return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
        return userFields[key]?.toString() ?? "";
      });
    };
    const prompt = `You are ${actor.first_name} ${actor.last_name}. 
        
        - Your role: ${actor.role}
        - Your persona: ${actor.persona_tags.join(", ")}
        - Topic: ${dialogue.title}         
        - Context: ${renderTemplate(dialogue.context)}
        - Current phase: ${currentPhase}
        INSTRUCTIONS:
              1. Respond as ${actor.first_name}.
              2. Keep responses natural and conversational and short (2-3 sentences)
              3. Reference the web if needed for more context.
              4. Provide 3-4 responses that the user might say each with varying communication styles, strengths and weaknesses.
              5. Decide what phase should be next (introduction, main_topic or wrap_up)
              RESPONSE FORMAT (JSON):
              {
                "content": "Your response",
                "userResponseOptions": ["response1", "response2", "response3", "response4"],
                "nextPhase": "same_phase_or_next_phase"
              }`;

    return prompt;
  }

  /**
   * Build prompt for analyzing user response
   */
  private buildAnalysisPrompt(
    userInput: string,
    context: DialogueContext
  ): string {
    const { dialogue, scoringCategories, currentPhase } = context;
    return `Analyze this user response in a social interaction context:

            USER RESPONSE: "${userInput}"

            CONTEXT:
            - Topic: ${dialogue.title}
            - Context - ${dialogue.context}
            - Current Phase: ${currentPhase}

            SCORING CRITERIA: ${scoringCategories.map(
              (cat) => `${cat.name} (1-5): ${cat.description}`
            )}

            RESPONSE FORMAT (JSON):
            {
              "scores": {
                "category_name": 4,
                ...
              
              },
              "betterResponse": "A possible response that could be better or just as good as the user's response.",

              "feedback": "Overall feedback about the response, breifly touching on strengths and improvemens, if any",
            }`;
  }

  /**
   * Parse actor response from AI
   */
  private parseActorResponse(
    response: Response,
    context: DialogueContext
  ): ActorResponse {
    try {
      const parsed = JSON.parse(response.output_text);
      return {
        content: parsed.content || "I'm not sure how to respond to that.",
        userResponseOptions: parsed.suggestedResponses || [],
        nextPhase: parsed.nextPhase,
        contextUsed: parsed?.contextUsed || [],
      };
    } catch (error) {
      console.error("Error parsing actor response:", error);
      return this.getFallbackActorResponse(context);
    }
  }

  /**
   * Parse user response analysis from AI
   */
  private parseUserAnalysis(response: string): UserResponseAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        scores: parsed.scores || {},
        feedback: parsed.feedback || "Good response!",
        betterResponse:
          parsed.betterResponse ||
          "A better response could not be made. Great Job!",
      };
    } catch (error) {
      console.error("Error parsing user analysis:", error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Fallback actor response when AI fails
   */
  private getFallbackActorResponse(context: DialogueContext): ActorResponse {
    const fallbackResponses = {
      introduction: "Hello! I'm glad we have a chance to talk today.",
      main_topic: "That's interesting. Can you tell me more about that?",
      wrap_up: "This has been a great conversation. Thank you for sharing.",
      completed: "Take care!",
    };

    return {
      content: fallbackResponses[context.currentPhase] || "I see.",
      userResponseOptions: [],
    };
  }

  /**
   * Fallback analysis when AI fails
   */
  private getFallbackAnalysis(): UserResponseAnalysis {
    return {
      scores: {
        clarity: 6,
        empathy: 6,
        assertiveness: 6,
        social_awareness: 6,
        self_advocacy: 6,
      },
      feedback:
        "Good response! Keep practicing to improve your communication skills.",
    };
  }
}
