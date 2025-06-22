/**
 * Pica API service for fetching live context and current information
 */

import type { Dialogue, Scenario } from "../types";

export interface PicaContextRequest {
  query: string;
  categories?: string[];
  timeframe?: "recent" | "today" | "week" | "month";
  maxResults?: number;
}

export interface PicaContextItem {
  title: string;
  content: string;
  source: string;
  timestamp: string;
  relevanceScore: number;
  category: string;
}

export interface PicaContextResponse {
  items: PicaContextItem[];
  query: string;
  totalResults: number;
}

class PicaService {
  private baseUrl = "https://api.picaos.com/v1/passthrough";
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_PICA_API_KEY || "";
    if (!this.apiKey) {
      console.warn(
        "Pica API key not found. Live context features will be disabled."
      );
    }
  }

  /**
   * Fetch live context based on a query
   */
  async fetchContext(
    request: PicaContextRequest
  ): Promise<PicaContextResponse> {
    if (!this.apiKey) {
      // Return mock data when API key is not available
      return this.getMockContext(request.query);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          "x-pica-secret": import.meta.env.VITE_PICA_API_KEY,
          "x-pica-connection-key": import.meta.env.VITE_SERPAI_CONNECTION_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        //
        // body: '{\n    "messages": [{"role": "user", "content": "What connections do I have access to?"}]\n}',
        body: JSON.stringify({
          query: request.query,
          categories: request.categories || ["news", "culture", "technology"],
          timeframe: request.timeframe || "recent",
          max_results: request.maxResults || 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Pica API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformPicaResponse(data);
    } catch (error) {
      console.error("Error fetching Pica context:", error);
      // Fallback to mock data on error
      return this.getMockContext(request.query);
    }
  }

  /**
   * Get context relevant to a dialogue topic
   */
  async getDialogueContext(
    scenario: Scenario,
    dialogue: Dialogue,
    currentPhase?: string,
    currentTopic?: string
  ): Promise<PicaContextResponse> {
    const queryParts = [
      currentTopic,
      `Scenario: ${scenario.title}`,
      `Dialogue: ${dialogue.title}`,
      currentPhase ? `Phase: ${currentPhase}` : "",

      dialogue.scoring_categories.length
        ? `Social Categories being evaluated: ${dialogue.scoring_categories.join(
            ", "
          )}`
        : "",
    ];

    const query = queryParts.filter(Boolean).join(" | ");

    return this.fetchContext({
      query,
      categories: ["news", "culture", "social", "psychology", "trends"],
      timeframe: "recent",
      maxResults: 5,
    });
  }
  /**
   * Get context based on user input
   */
  async getUserInputContext(userInput: string): Promise<PicaContextResponse> {
    // Extract key topics from user input
    const keywords = this.extractKeywords(userInput);
    const query = keywords.join(" ");

    return this.fetchContext({
      query,
      categories: ["news", "culture", "technology", "social"],
      timeframe: "today",
      maxResults: 2,
    });
  }

  /**
   * Transform Pica API response to our format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformPicaResponse(data: any): PicaContextResponse {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (data.results || []).map((item: any) => ({
        title: item.title || "",
        content: item.content || item.summary || "",
        source: item.source || "Unknown",
        timestamp: item.timestamp || new Date().toISOString(),
        relevanceScore: item.relevance_score || 0.5,
        category: item.category || "general",
      })),
      query: data.query || "",
      totalResults: data.total_results || 0,
    };
  }

  /**
   * Extract keywords from text for context queries
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !this.isStopWord(word));

    return [...new Set(words)].slice(0, 5);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "the",
      "and",
      "but",
      "for",
      "are",
      "with",
      "they",
      "this",
      "that",
      "have",
      "from",
      "will",
      "been",
      "said",
      "each",
      "which",
      "their",
      "time",
      "would",
      "there",
      "what",
      "about",
      "when",
      "where",
      "how",
    ]);
    return stopWords.has(word);
  }

  /**
   * Mock context for development/fallback
   */
  private getMockContext(query: string): PicaContextResponse {
    const mockItems: PicaContextItem[] = [
      {
        title: "Recent Social Trends",
        content:
          "Current social media trends show increased focus on authentic communication and mental health awareness.",
        source: "Social Media Analytics",
        timestamp: new Date().toISOString(),
        relevanceScore: 0.8,
        category: "social",
      },
      {
        title: "Communication Best Practices",
        content:
          "Recent studies highlight the importance of active listening and empathetic responses in social interactions.",
        source: "Psychology Today",
        timestamp: new Date().toISOString(),
        relevanceScore: 0.7,
        category: "psychology",
      },
    ];

    return {
      items: mockItems,
      query,
      totalResults: mockItems.length,
    };
  }
}

export const picaService = new PicaService();
