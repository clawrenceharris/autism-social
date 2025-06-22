import { useState, useCallback } from "react";
import {
  fetchContext,
  generateDialogueResponse,
  formatContextForPrompt,
  type ContextResponse,
  type DialogueResponse,
  type DialogueRequest,
} from "../services/contextDialogue";
import type { Dialogue, Scenario } from "../types";

interface UseContextDialogueOptions {
  cacheResults?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

interface UseContextDialogueReturn {
  contextData: ContextResponse | null;
  dialogueResponse: DialogueResponse | null;
  loading: boolean;
  error: Error | null;
  fetchDialogueContext: (
    scenario: Scenario,
    dialogue: Dialogue,
    phase?: string
  ) => Promise<ContextResponse>;
  generateResponse: (
    request: Omit<DialogueRequest, "context">,
    contextData?: ContextResponse | null
  ) => Promise<DialogueResponse>;
  clearContext: () => void;
  clearError: () => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_OPTIONS: UseContextDialogueOptions = {
  cacheResults: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Hook for managing context-aware dialogue interactions
 */
export const useContextDialogue = (
  options?: UseContextDialogueOptions
): UseContextDialogueReturn => {
  const [contextData, setContextData] = useState<ContextResponse | null>(null);
  const [dialogueResponse, setDialogueResponse] =
    useState<DialogueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cache] = useState<
    Map<string, CacheEntry<ContextResponse | DialogueResponse>>
  >(new Map());

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const getCacheKey = useCallback((key: string): string => {
    return `context_dialogue_${key}`;
  }, []);

  const getFromCache = useCallback(
    <T extends ContextResponse | DialogueResponse>(key: string): T | null => {
      if (!opts.cacheResults) return null;

      const cacheKey = getCacheKey(key);
      const entry = cache.get(cacheKey);
      if (!entry) return null;

      const now = Date.now();
      if (
        now - entry.timestamp >
        (opts.cacheTTL || DEFAULT_OPTIONS.cacheTTL!)
      ) {
        cache.delete(cacheKey);
        return null;
      }

      return entry.data as T;
    },
    [cache, getCacheKey, opts.cacheResults, opts.cacheTTL]
  );

  const setToCache = useCallback(
    <T extends ContextResponse | DialogueResponse>(
      key: string,
      data: T
    ): void => {
      if (!opts.cacheResults) return;

      const cacheKey = getCacheKey(key);
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    },
    [cache, getCacheKey, opts.cacheResults]
  );

  /**
   * Fetch context for a dialogue scenario
   */
  const fetchDialogueContext = useCallback(
    async (
      scenario: Scenario,
      dialogue: Dialogue,
      phase?: string
    ): Promise<ContextResponse> => {
      try {
        setLoading(true);
        setError(null);

        // Create cache key
        const cacheKey = `dialogue_context_${scenario.id}_${dialogue.id}_${
          phase || ""
        }`;

        // Check cache first
        const cachedResult = getFromCache<ContextResponse>(cacheKey);
        if (cachedResult) {
          setContextData(cachedResult);
          return cachedResult;
        }

        // Fetch from service
        const queryParts = [
          `Scenario: ${scenario.title}`,
          `Dialogue: ${dialogue.title}`,
          phase ? `Phase: ${phase}` : "",
          dialogue.scoring_categories.length
            ? `Social Categories being evaluated: ${dialogue.scoring_categories.join(
                ", "
              )}`
            : "",
        ];

        const query = queryParts.filter(Boolean).join(" | ");

        const result = await fetchContext(query, {
          categories: ["news", "culture", "social", "psychology", "trends"],
          timeframe: "recent",
        });

        // Cache the result
        setToCache(cacheKey, result);
        setContextData(result);

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch context");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setToCache]
  );

  /**
   * Generate dialogue response with context
   */
  const generateResponse = useCallback(
    async (
      request: Omit<DialogueRequest, "context">,
      contextData?: ContextResponse | null
    ): Promise<DialogueResponse> => {
      try {
        setLoading(true);
        setError(null);

        // Use provided context or current context
        const contextItems = contextData?.items || [];
        const context = formatContextForPrompt(contextItems);

        // Generate response
        const result = await generateDialogueResponse({
          ...request,
          context,
        });

        setDialogueResponse(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to generate dialogue response");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearContext = useCallback(() => {
    setContextData(null);
    setDialogueResponse(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    contextData,
    dialogueResponse,
    loading,
    error,
    fetchDialogueContext,
    generateResponse,
    clearContext,
    clearError,
  };
};

export default useContextDialogue;
