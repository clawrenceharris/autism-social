import type { Response } from "openai/resources/responses/responses.mjs";
import type useOpenAI from "../hooks/useOpenAI";
import type { ScoreSummary } from "../types";
import type { DialogueContext } from "../xstate/dialogueMachine";

export interface ConversationMessage {
  id: string;
  speaker: "user" | "actor";
  content: string;
  phase: DialoguePhase;
  analysis?: UserResponseAnalysis;
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
  private messageCount = 0;
  private mockMode: boolean = false;

  constructor(openai: ReturnType<typeof useOpenAI>) {
    this.openai = openai;
  }

  /**
   * Generate actor response based on context and conversation history
   */
  async generateActorResponse(
    context: DialogueContext
  ): Promise<ActorResponse> {
    if (this.mockMode) {
      // Simulate a response
      return {
        content: `Hi, this is a mock reply for phase ${context.currentPhase}.`,
        userResponseOptions: [
          "That's interesting!",
          "This is a long response choice for testing purposes and to see whether it will fit in the response box",
          "I don't quite follow.",
          "That makes sense.",
        ],
        nextPhase:
          context.currentPhase === "introduction"
            ? "main_topic"
            : context.currentPhase === "main_topic"
            ? "wrap_up"
            : "completed",
      };
    }
    const prompt = this.buildActorPrompt(context);

    const { currentUserInput } = context;
    this.history.push({
      role: "user",
      content: currentUserInput || "Waiting for your initial response",
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
      this.messageCount++;
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
    if (this.mockMode) {
      return {
        scores: {
          clarity: 2,
          empathy: 3,
          assertiveness: 1,
        },
        feedback: "Mock analysis: Solid effort, some room to grow.",
        betterResponse: "Sure, I understand your point better now.",
      };
    }
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

    // Determine if we should suggest a phase transition based on message count
    const suggestPhaseTransition =
      this.messageCount >= 2 && currentPhase === "introduction";
    const suggestWrapUp =
      this.messageCount >= 5 && currentPhase === "main_topic";

    const phaseGuidance = suggestWrapUp
      ? "Consider transitioning to wrap_up phase as the conversation has progressed significantly."
      : suggestPhaseTransition
      ? "Consider transitioning to main_topic phase as the introduction is complete."
      : "Maintain the current phase unless the conversation naturally progresses.";

    const prompt = `This is a social interaction for user to practice various social situations. You must stay in character. 
    You are ${actor.first_name} ${actor.last_name}, ${renderTemplate(
      dialogue.context
    )}. 
        
        - Your role: ${actor.role}
        - Your persona: ${actor.persona_tags.join(", ")}
        - Dialogue title: ${dialogue.title}         
        - Current phase: ${currentPhase}
        - Message count: ${this.messageCount}
        
        PHASE GUIDANCE: ${phaseGuidance}
        
        INSTRUCTIONS:

              1. Respond as ${actor.first_name}.
              2. Keep responses natural and conversational and short (2-3 sentences)
              4. Provide 3 example user responses (1 sentence):
                - One should demonstrate an ideal response (clear, empathetic, assertive, socially aware, and self-advocating).
                - The others should each reflect a one or more weaknesses (e.g. lack of social awareness, empathy, clarity, assertiveness, and/or self-advocacy).
              5. Decide what phase should be next based on conversation progress:
                - introduction: Initial greeting and setup
                - main_topic: Core conversation about the topic
                - wrap_up: Concluding the conversation naturally
                - completed: Only use if conversation is definitely over
              
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
    const { dialogue, currentPhase, currentActorResponse, currentUserInput } =
      context;
    return `Analyze this user response in a social interaction context:

            USER RESPONSE: "${userInput}"

            CONTEXT:
            - Topic: ${dialogue.title}
            - Context: ${dialogue.context}
            - Current Phase: ${currentPhase}
            - Dialogue: User responded "${currentUserInput}" to "${currentActorResponse}"
            SCORING CRITERIA: ${dialogue.scoring_categories.join(
              "(either 0 or 1), "
            )}

            RESPONSE FORMAT (JSON):
            {
              "scores": {
                "category_name": 1,
                "category_name": 0,

              },
              "betterResponse": "A possible response that could be better or just as good as the user's current response.",

              "feedback": "Overall feedback about the response, breifly touching on strengths and improvemens.",
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

      // Determine if we should force a phase transition based on message count
      let nextPhase = parsed.nextPhase;

      // Force phase transitions based on message count if AI didn't suggest one
      if (nextPhase === context.currentPhase || !nextPhase) {
        if (this.messageCount >= 2 && context.currentPhase === "introduction") {
          nextPhase = "main_topic";
        } else if (
          this.messageCount >= 3 &&
          context.currentPhase === "main_topic"
        ) {
          nextPhase = "wrap_up";
        } else if (
          this.messageCount >= 2 &&
          context.currentPhase === "wrap_up"
        ) {
          nextPhase = "completed";
        }
      }

      return {
        content: parsed.content || "I'm not sure how to respond to that.",
        userResponseOptions: parsed.userResponseOptions || [],
        nextPhase: nextPhase,
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
