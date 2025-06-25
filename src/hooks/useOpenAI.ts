import { useState, useCallback, useRef, useEffect } from "react";
import { openai } from "../lib/openai";
import type {
  Response,
  ResponseCreateParamsNonStreaming,
} from "openai/resources/responses/responses.mjs";

// Define types for the hook parameters and return values
export interface UseOpenAIOptions {
  model: string;
  temperature?: number;
  maxOutputTokens?: number;

  cacheResults?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

export interface UseOpenAIReturn {
  generateText: (
    params?: Partial<ResponseCreateParamsNonStreaming>,
    options?: Partial<UseOpenAIOptions>
  ) => Promise<Response>;

  loading: boolean;
  error: Error | null;
  clearError: () => void;
  lastResponse: Response | null;
}

interface CacheEntry {
  response: Response;
  timestamp: number;
}

// Default options
const DEFAULT_OPTIONS: UseOpenAIOptions = {
  model: "gpt-4.1-mini",
  temperature: 0.7,
  maxOutputTokens: 400,
  cacheResults: true,
  cacheTTL: 1000 * 60 * 60, // 1 hour
};

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 10,
  perTimeWindow: 60 * 1000, // 1 minute
};

export const useOpenAI = (
  initialOptions?: Partial<UseOpenAIOptions>
): UseOpenAIReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResponse, setLastResponse] = useState<Response | null>(null);

  // Use refs for options to avoid unnecessary re-renders
  const optionsRef = useRef<UseOpenAIOptions>({
    ...DEFAULT_OPTIONS,
  });

  // Cache for storing responses
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  // Rate limiting
  const requestTimestampsRef = useRef<number[]>([]);

  // Update options when initialOptions change
  useEffect(() => {
    optionsRef.current = {
      ...DEFAULT_OPTIONS,
      ...initialOptions,
    };
  }, [initialOptions]);

  function getSessionCache(key: string): Response | null {
    try {
      const item = sessionStorage.getItem(`openai-cache:${key}`);
      if (!item) return null;
      const { response, timestamp } = JSON.parse(item);
      const ttl = optionsRef.current.cacheTTL || DEFAULT_OPTIONS.cacheTTL!;
      if (Date.now() - timestamp > ttl) {
        sessionStorage.removeItem(`openai-cache:${key}`);
        return null;
      }
      return response;
    } catch {
      return null;
    }
  }
  function getCacheKey(params: ResponseCreateParamsNonStreaming): string {
    return JSON.stringify({
      model: params.model,
      input: params.input,
      temperature: params.temperature,
      max_tokens: params.max_output_tokens,
    });
  }
  // Check if we're rate limited
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const recentRequests = requestTimestampsRef.current.filter(
      (timestamp) => now - timestamp < RATE_LIMIT.perTimeWindow
    );

    requestTimestampsRef.current = recentRequests;

    if (recentRequests.length >= RATE_LIMIT.maxRequests) {
      return true;
    }

    requestTimestampsRef.current.push(now);
    return false;
  }, []);

  // Generate a cache key for a prompt and options

  function setSessionCache(key: string, response: Response) {
    try {
      sessionStorage.setItem(
        `openai-cache:${key}`,
        JSON.stringify({ response, timestamp: Date.now() })
      );
    } catch {
      console.error("Error setting cache");
    }
  }
  // Check if a cached response is valid

  // Clear the error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generate text using the Gemini API
  const generateText = useCallback(
    async (
      params?: Partial<ResponseCreateParamsNonStreaming>
    ): Promise<Response> => {
      try {
        setLoading(true);
        setError(null);
        // Check rate limiting
        if (checkRateLimit()) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        const key = getCacheKey({
          model: optionsRef.current.model,
          input: params?.input ?? [],
          temperature: params?.temperature ?? optionsRef.current.temperature,
          max_output_tokens:
            params?.max_output_tokens ?? optionsRef.current.maxOutputTokens,
        });

        const sessionCached = getSessionCache(key);
        if (sessionCached) {
          setLastResponse(sessionCached);
          return sessionCached;
        }

        // Generate the text
        const response = await openai.responses.create({
          ...params,
          model: optionsRef.current.model,
          temperature: params?.temperature ?? optionsRef.current.temperature,
          max_output_tokens: optionsRef.current.maxOutputTokens,
          input: params?.input ?? [],
          // tools: [{ type: "web_search_preview" }],
        });
        // Cache the result if enabled
        setSessionCache(key, response);

        setLastResponse(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [checkRateLimit]
  );

  // Clean up the cache periodically
  useEffect(() => {
    const cleanupCache = () => {
      const now = Date.now();
      const ttl = optionsRef.current.cacheTTL || DEFAULT_OPTIONS.cacheTTL!;

      for (const [key, entry] of cacheRef.current.entries()) {
        if (now - entry.timestamp > ttl) {
          cacheRef.current.delete(key);
        }
      }
    };

    const intervalId = setInterval(cleanupCache, 60 * 1000); // Clean up every minute

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return {
    generateText,
    loading,
    error,
    clearError,
    lastResponse,
  };
};

export default useOpenAI;
