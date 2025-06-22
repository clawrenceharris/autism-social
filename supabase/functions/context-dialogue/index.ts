import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Environment variables
const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY") || "";
const PICA_FIRECRAWL_CONNECTION_KEY = Deno.env.get("PICA_FIRECRAWL_CONNECTION_KEY") || "";
const PICA_OPENAI_CONNECTION_KEY = Deno.env.get("PICA_OPENAI_CONNECTION_KEY") || "";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface ContextRequest {
  query: string;
  categories?: string[];
  timeframe?: "recent" | "today" | "week" | "month";
}

interface DialogueRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Validate API keys
    if (!PICA_SECRET_KEY || !PICA_FIRECRAWL_CONNECTION_KEY || !PICA_OPENAI_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing required environment variables. Please set PICA_SECRET_KEY, PICA_FIRECRAWL_CONNECTION_KEY, and PICA_OPENAI_CONNECTION_KEY.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "context") {
      return await handleContextRequest(req);
    } else if (path === "generate") {
      return await handleGenerateRequest(req);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint. Use /context or /generate" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Fetch context from Firecrawl
 */
async function handleContextRequest(req: Request): Promise<Response> {
  try {
    const { query, categories, timeframe }: ContextRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const firecrawlRes = await fetch("https://api.picaos.com/v1/passthrough/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_FIRECRAWL_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GClH-wc_XMo::Lm5ew3DCSp2L1yETSndVHA",
      },
      body: JSON.stringify({
        query,
        categories: categories || ["news", "culture", "technology", "social"],
        timeframe: timeframe || "recent",
      }),
    });

    if (!firecrawlRes.ok) {
      const errorText = await firecrawlRes.text();
      throw new Error(`Firecrawl API error: ${firecrawlRes.status} - ${errorText}`);
    }

    const contextData = await firecrawlRes.json();

    // Transform the response to a more usable format
    const transformedData = {
      items: (contextData.data || []).map((item: any) => ({
        title: item.title || "",
        content: item.description || item.markdown || "",
        source: item.url || "",
        timestamp: new Date().toISOString(),
        relevanceScore: 0.8, // Mock score since Firecrawl doesn't provide this
        category: "general",
      })),
      query,
      totalResults: contextData.data?.length || 0,
    };

    return new Response(JSON.stringify(transformedData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching context:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch context" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Generate dialogue response using OpenAI
 */
async function handleGenerateRequest(req: Request): Promise<Response> {
  try {
    const {
      context,
      userInput,
      actor,
      scenario,
      dialogue,
      conversationHistory = [],
    }: DialogueRequest = await req.json();

    // Validate required fields
    if (!userInput || !actor || !scenario || !dialogue) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format conversation history for the prompt
    const formattedHistory = conversationHistory
      .map((msg) => `${msg.speaker === "actor" ? actor.firstName : "User"}: ${msg.content}`)
      .join("\n");

    // Build system prompt with context
    const systemPrompt = `You are ${actor.firstName} ${actor.lastName}, ${actor.bio || actor.role}

SCENARIO: ${scenario.title} - ${scenario.description}
DIALOGUE: ${dialogue.title}
CURRENT PHASE: ${dialogue.phase}

${context ? `CURRENT CONTEXT (use naturally in conversation):\n${context}\n` : ""}

${formattedHistory ? `CONVERSATION HISTORY:\n${formattedHistory}\n` : ""}

INSTRUCTIONS:
1. Respond as ${actor.firstName} in character.
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

    // Call OpenAI API
    const openaiRes = await fetch("https://api.picaos.com/v1/passthrough/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_OPENAI_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      throw new Error(`OpenAI API error: ${openaiRes.status} - ${errorText}`);
    }

    const aiResponse = await openaiRes.json();
    
    // Extract the response content
    const responseContent = aiResponse.choices[0]?.message?.content;
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      console.log("Raw response:", responseContent);
      
      // Fallback response if parsing fails
      parsedResponse = {
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
        nextPhase: dialogue.phase,
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating dialogue:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate dialogue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}