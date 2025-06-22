import type { ScoreSummary } from "../types";
import { useGemini } from "../hooks/useGemini";
import type { DialogueContext } from "../xstate/createDialogueMachine";

export interface ConversationMessage {
  id: string;
  speaker: "user" | "actor";
  content: string;
  timestamp: Date;
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
  suggestedUserResponses: SuggestedResponse[];
  nextPhase?: DialoguePhase;
  contextUsed?: string[];
}

export interface SuggestedResponse {
  id: string;
  content: string;
  scores: ScoreSummary;
  reasoning: string;
}

export interface UserResponseAnalysis {
  scores: ScoreSummary;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Service for managing dynamic dialogue interactions with AI-generated responses
 */
export class DynamicDialogueService {
  private gemini: ReturnType<typeof useGemini>;

  constructor(gemini: ReturnType<typeof useGemini>) {
    this.gemini = gemini;
  }

  /**
   * Generate actor response based on context and conversation history
   */
  async generateActorResponse(
    context: DialogueContext
  ): Promise<ActorResponse> {
    const prompt = this.buildActorPrompt(context);

    try {
      const response = await this.gemini.generateText(prompt);
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
      const response = await this.gemini.generateText(prompt);
      return this.parseUserAnalysis(response);
    } catch (error) {
      console.error("Error analyzing user response:", error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Determine if conversation should transition to next phase
   */
  async shouldTransitionPhase(context: DialogueContext): Promise<{
    shouldTransition: boolean;
    nextPhase?: DialoguePhase;
    reason?: string;
  }> {
    const prompt = this.buildPhaseTransitionPrompt(context);

    try {
      const response = await this.gemini.generateText(prompt);
      return this.parsePhaseTransition(response);
    } catch (error) {
      console.error("Error determining phase transition:", error);
      return { shouldTransition: false };
    }
  }

  /**
   * Build prompt for actor response generation
   */
  private buildActorPrompt(context: DialogueContext): string {
    const { actor, conversationHistory, currentPhase, picaContext, user } =
      context;

    let prompt = `You are ${actor.first_name} ${actor.last_name}, ${actor.bio}

SCENARIO: ${context.scenario}
DIALOGUE: ${context.dialogue}
CURRENT PHASE: ${currentPhase}

`;

    // Add user profile context
    if (user) {
      prompt += `USER PROFILE:
    - First Name: ${user.first_name}
    - Last Name: ${user.last_name}
    - Bio: ${user.bio}
    - Goals: ${user.goals?.join(", ") || "none"}

`;
    }

    // Add live context from Pica
    if (picaContext && picaContext.items.length > 0) {
      prompt += `CURRENT CONTEXT (use naturally in conversation):
${picaContext.items
  .map((item) => `- ${item.title}: ${item.content}`)
  .join("\n")}

`;
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      prompt += `CONVERSATION HISTORY:
${conversationHistory
  .map(
    (msg) =>
      `${msg.speaker === "user" ? "User" : actor.first_name}: ${msg.content}`
  )
  .join("\n")}

`;
    }

    prompt += `INSTRUCTIONS:
1. Respond as ${actor.first_name} in character.
2. Keep responses natural and conversational (1-2 sentences max).
3. Reference CURRENT CONTEXT if relevant.
4. Guide the conversation for this phase:
   - introduction: Welcome, build comfort
   - main_topic: Engage on topic
   - wrap_up: Conclude positively
5. Provide 3 suggestedUserResponses, clearly scored.

RESPONSE FORMAT (JSON):
{
  "content": "Actor's response",
  "suggestedUserResponses": [
    {
      "id": "response_1",
      "content": "response text",
      "scores": {"clarity": 8, "empathy": 5, "assertiveness": 9, "social_awareness": 6, "self_advocacy": 7},
      "reasoning": "explanation of score"
    },
    { ... },
    { ... }
  ],
  "contextUsed": ["list of context items used"],
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
    return `Analyze this user response in a social dialogue context:

USER RESPONSE: "${userInput}"

CONTEXT:
- Scenario: ${context.scenario.title}
- Dialogue: ${context.dialogue.title}
- Current Phase: ${context.currentPhase}
- Actor: ${context.actor.first_name} ${context.actor.last_name}

SCORING CRITERIA:
- Clarity (1-10): How clear and understandable is the response?
- Empathy (1-10): Does it show understanding of others' feelings?
- Assertiveness (1-10): Is it confident without being aggressive?
- Social Awareness (1-10): Does it show understanding of social context?
- Self Advocacy (1-10): Does it appropriately express the user's needs?

RESPONSE FORMAT (JSON):
{
  "scores": {
    "clarity": 7,
    "empathy": 6,
    "assertiveness": 8,
    "social_awareness": 7,
    "self_advocacy": 6
  },
  "feedback": "Overall feedback about the response",
  "strengths": ["List of what was done well"],
  "improvements": ["List of areas for improvement"]
}`;
  }

  /**
   * Build prompt for phase transition determination
   */
  private buildPhaseTransitionPrompt(context: DialogueContext): string {
    const recentMessages = context.conversationHistory.slice(-4);

    return `Determine if this conversation should transition to the next phase:

CURRENT PHASE: ${context.currentPhase}
RECENT CONVERSATION:
${recentMessages
  .map((msg) => `${msg.speaker === "user" ? "User" : "Actor"}: ${msg.content}`)
  .join("\n")}

PHASE PROGRESSION:
introduction → main_topic → wrap_up → completed

TRANSITION CRITERIA:
- introduction: Move to main_topic after 2-3 exchanges and proper greeting
- main_topic: Move to wrap_up after substantial topic discussion (4-6 exchanges)
- wrap_up: Move to completed after proper conclusion

RESPONSE FORMAT (JSON):
{
  "shouldTransition": true/false,
  "nextPhase": "next_phase_name",
  "reason": "Explanation for the decision"
}`;
  }

  /**
   * Parse actor response from AI
   */
  private parseActorResponse(
    response: string,
    context: DialogueContext
  ): ActorResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        content: parsed.content || "I'm not sure how to respond to that.",
        suggestedUserResponses: parsed.suggestedResponses || [],
        nextPhase: parsed.nextPhase,
        contextUsed: parsed.contextUsed || [],
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
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
      };
    } catch (error) {
      console.error("Error parsing user analysis:", error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Parse phase transition response from AI
   */
  private parsePhaseTransition(response: string): {
    shouldTransition: boolean;
    nextPhase?: DialoguePhase;
    reason?: string;
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        shouldTransition: parsed.shouldTransition || false,
        nextPhase: parsed.nextPhase,
        reason: parsed.reason,
      };
    } catch (error) {
      console.error("Error parsing phase transition:", error);
      return { shouldTransition: false };
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
      suggestedUserResponses: [
        {
          id: "fallback_1",
          content: "I understand.",
          scores: {
            clarity: 6,
            empathy: 6,
            assertiveness: 5,
            social_awareness: 6,
            self_advocacy: 5,
          },
          reasoning: "A neutral, understanding response.",
        },
        {
          id: "fallback_2",
          content: "Could you help me understand better?",
          scores: {
            clarity: 7,
            empathy: 5,
            assertiveness: 6,
            social_awareness: 7,
            self_advocacy: 8,
          },
          reasoning: "Asks for clarification and advocates for understanding.",
        },
        {
          id: "fallback_3",
          content: "That makes sense to me.",
          scores: {
            clarity: 6,
            empathy: 7,
            assertiveness: 5,
            social_awareness: 7,
            self_advocacy: 4,
          },
          reasoning: "Shows empathy and social awareness.",
        },
      ],
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
      strengths: ["Participated in the conversation"],
      improvements: ["Try to be more specific in your responses"],
    };
  }
}
