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
  // private baseUrl = "https://api.picaos.com/v1/passthrough";
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
    // Return mock data when API key is not available

    try {
      const response = await fetch(
        "https://api.picaos.com/v1/passthrough/v1/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-pica-secret": import.meta.env.PICA_SECRET_KEY!,
            "x-pica-connection-key": import.meta.env
              .PICA_FIRECRAWL_CONNECTION_KEY!,
            "x-pica-action-id":
              "conn_mod_def::GClH-wc_XMo::Lm5ew3DCSp2L1yETSndVHA",
          },
          body: JSON.stringify({
            query: request.query,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Pica API error: ${response.status}`);
      }
      const data = await response.json();
      // return this.transformPicaResponse(data);
      console.log(data);
      return data;
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
    // currentPhase?: string,
    currentTopic?: string
  ): Promise<PicaContextResponse> {
    const queryParts = [
      currentTopic,
      `Scenario: ${scenario.title}: ${dialogue.title}`,
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
  // private transformPicaResponse(data: any): PicaContextResponse {
  //   return {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     items: (data.results || []).map((item: any) => ({
  //       title: item.title || "",
  //       content: item.content || item.summary || "",
  //       source: item.source || "Unknown",
  //       timestamp: item.timestamp || new Date().toISOString(),
  //       relevanceScore: item.relevance_score || 0.5,
  //       category: item.category || "general",
  //     })),
  //     query: data.query || "",
  //     totalResults: data.total_results || 0,
  //   };
  // }

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
