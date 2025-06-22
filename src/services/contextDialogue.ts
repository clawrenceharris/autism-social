import { supabase } from "../lib/supabase";

export interface ContextItem {
  title: string;
  content: string;
  source: string;
  timestamp: string;
  relevanceScore: number;
  category: string;
}

export interface ContextResponse {
  items: ContextItem[];
  query: string;
  totalResults: number;
}

export interface SuggestedResponse {
  id: string;
  content: string;
  scores: {
    clarity: number;
    empathy: number;
    assertiveness: number;
    social_awareness: number;
    self_advocacy: number;
  };
  reasoning: string;
}

export interface DialogueResponse {
  content: string;
  suggestedUserResponses: SuggestedResponse[];
  contextUsed?: string[];
  nextPhase?: string;
}

export interface DialogueRequest {
  context: string;
  userInput: string;
  actor: {
    firstName: string;
    lastName: string;
    role: string;
    bio: string;
  };
  scenario: {
    title: string;
    description: string;
  };
  dialogue: {
    title: string;
    phase: "introduction" | "main_topic" | "wrap_up" | "completed";
    scoringCategories: string[];
  };
  conversationHistory?: Array<{
    speaker: "user" | "actor";
    content: string;
  }>;
}

/**
 * Fetch context from the edge function
 */
export async function fetchContext(query: string, options?: {
  categories?: string[];
  timeframe?: "recent" | "today" | "week" | "month";
}): Promise<ContextResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("context-dialogue/context", {
      body: {
        query,
        categories: options?.categories || ["news", "culture", "technology", "social"],
        timeframe: options?.timeframe || "recent",
      },
    });

    if (error) {
      throw new Error(`Error fetching context: ${error.message}`);
    }

    return data as ContextResponse;
  } catch (error) {
    console.error("Error in fetchContext:", error);
    
    // Return mock data as fallback
    return {
      items: [
        {
          title: "Fallback Context",
          content: "This is fallback content when the context API is unavailable.",
          source: "Local Fallback",
          timestamp: new Date().toISOString(),
          relevanceScore: 0.5,
          category: "general",
        },
      ],
      query,
      totalResults: 1,
    };
  }
}

/**
 * Generate dialogue response using the edge function
 */
export async function generateDialogueResponse(request: DialogueRequest): Promise<DialogueResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("context-dialogue/generate", {
      body: request,
    });

    if (error) {
      throw new Error(`Error generating dialogue: ${error.message}`);
    }

    return data as DialogueResponse;
  } catch (error) {
    console.error("Error in generateDialogueResponse:", error);
    
    // Return fallback response
    return {
      content: "I'm not sure how to respond to that.",
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
      contextUsed: [],
      nextPhase: request.dialogue.phase,
    };
  }
}

/**
 * Utility function to format context items into a string
 */
export function formatContextForPrompt(contextItems: ContextItem[]): string {
  if (!contextItems || contextItems.length === 0) {
    return "";
  }
  
  return contextItems
    .map((item) => `- ${item.title}: ${item.content}`)
    .join("\n");
}

/**
 * Get context for a dialogue scenario
 */
export async function getDialogueContext(
  scenarioTitle: string,
  dialogueTitle: string,
  phase?: string
): Promise<ContextResponse> {
  const queryParts = [
    `Scenario: ${scenarioTitle}`,
    `Dialogue: ${dialogueTitle}`,
    phase ? `Phase: ${phase}` : "",
  ];

  const query = queryParts.filter(Boolean).join(" | ");

  return fetchContext(query, {
    categories: ["news", "culture", "social", "psychology", "trends"],
    timeframe: "recent",
  });
}

/**
 * Get context based on user input
 */
export async function getUserInputContext(userInput: string): Promise<ContextResponse> {
  return fetchContext(userInput, {
    categories: ["news", "culture", "technology", "social"],
    timeframe: "today",
  });
}