import { useState, useCallback } from "react";
import {
  picaService,
  type PicaContextRequest,
  type PicaContextResponse,
} from "../services/pica";
import type { Dialogue, Scenario } from "../types";

interface UsePicaContextOptions {
  autoFetch?: boolean;
  cacheResults?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

interface UsePicaContextReturn {
  context: PicaContextResponse | null;
  loading: boolean;
  error: Error | null;
  fetchContext: (request: PicaContextRequest) => Promise<PicaContextResponse>;
  getDialogueContext: (
    scenario: Scenario,
    dialogue: Dialogue,
    currentTopic?: string
  ) => Promise<PicaContextResponse>;
  getUserInputContext: (userInput: string) => Promise<PicaContextResponse>;
  clearContext: () => void;
  clearError: () => void;
}

interface CacheEntry {
  data: PicaContextResponse;
  timestamp: number;
}

const DEFAULT_OPTIONS: UsePicaContextOptions = {
  autoFetch: false,
  cacheResults: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Hook for fetching and managing Pica context data
 */
export const usePicaContext = (
  options?: UsePicaContextOptions
): UsePicaContextReturn => {
  const [context, setContext] = useState<PicaContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Simple in-memory cache
  const [cache] = useState<Map<string, CacheEntry>>(new Map());

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const getCacheKey = useCallback((request: PicaContextRequest): string => {
    return JSON.stringify({
      query: request.query,
      categories: request.categories,
      timeframe: request.timeframe,
      maxResults: request.maxResults,
    });
  }, []);

  const getFromCache = useCallback(
    (key: string): PicaContextResponse | null => {
      if (!opts.cacheResults) return null;

      const entry = cache.get(key);
      if (!entry) return null;

      const now = Date.now();
      if (
        now - entry.timestamp >
        (opts.cacheTTL || DEFAULT_OPTIONS.cacheTTL!)
      ) {
        cache.delete(key);
        return null;
      }

      return entry.data;
    },
    [cache, opts.cacheResults, opts.cacheTTL]
  );

  const setToCache = useCallback(
    (key: string, data: PicaContextResponse): void => {
      if (!opts.cacheResults) return;

      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    },
    [cache, opts.cacheResults]
  );

  const fetchContext = useCallback(
    async (request: PicaContextRequest): Promise<PicaContextResponse> => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = getCacheKey(request);
        const cachedResult = getFromCache(cacheKey);
        if (cachedResult) {
          setContext(cachedResult);
          return cachedResult;
        }

        // Fetch from Pica service
        const result = await picaService.fetchContext(request);

        // Cache the result
        setToCache(cacheKey, result);

        setContext(result);
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
    [getCacheKey, getFromCache, setToCache]
  );

  const getDialogueContext = useCallback(
    async (
      scenario: Scenario,
      dialogue: Dialogue,
      currentTopic?: string
    ): Promise<PicaContextResponse> => {
      try {
        setLoading(true);
        setError(null);

        const result = await picaService.getDialogueContext(
          scenario,
          dialogue,
          currentTopic
        );
        setContext(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to fetch dialogue context");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserInputContext = useCallback(
    async (userInput: string): Promise<PicaContextResponse> => {
      try {
        setLoading(true);
        setError(null);

        const result = await picaService.getUserInputContext(userInput);
        setContext(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to fetch user input context");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearContext = useCallback(() => {
    setContext(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    context,
    loading,
    error,
    fetchContext,
    getDialogueContext,
    getUserInputContext,
    clearContext,
    clearError,
  };
};

export default usePicaContext;
