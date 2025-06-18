import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// Define types for the hook parameters and return values
export interface UseGeminiOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
  cacheResults?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

export interface UseGeminiReturn {
  generateText: (prompt: string, options?: Partial<UseGeminiOptions>) => Promise<string>;
  streamText: (
    prompt: string, 
    onChunk: (chunk: string) => void,
    options?: Partial<UseGeminiOptions>
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  lastResponse: string | null;
}

interface CacheEntry {
  response: string;
  timestamp: number;
}

// Default options
const DEFAULT_OPTIONS: UseGeminiOptions = {
  apiKey: import.meta.env.VITE_GEMINI_KEY,
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
  cacheResults: true,
  cacheTTL: 1000 * 60 * 60, // 1 hour
};

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 10,
  perTimeWindow: 60 * 1000, // 1 minute
};

/**
 * A React hook for generating text using Google's Gemini API
 */
export const useGemini = (initialOptions?: Partial<UseGeminiOptions>): UseGeminiReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  
  // Use refs for options to avoid unnecessary re-renders
  const optionsRef = useRef<UseGeminiOptions>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
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

  // Initialize the Gemini API client
  const getModel = useCallback((): GenerativeModel => {
    const apiKey = optionsRef.current.apiKey || import.meta.env.VITE_GEMINI_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is required. Provide it in the options or set VITE_GEMINI_KEY in your environment.');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: optionsRef.current.model || 'gemini-1.5-pro' });
  }, []);

  // Check if we're rate limited
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const recentRequests = requestTimestampsRef.current.filter(
      timestamp => now - timestamp < RATE_LIMIT.perTimeWindow
    );
    
    requestTimestampsRef.current = recentRequests;
    
    if (recentRequests.length >= RATE_LIMIT.maxRequests) {
      return true;
    }
    
    requestTimestampsRef.current.push(now);
    return false;
  }, []);

  // Generate configuration for the API request
  const generateConfig = useCallback((options?: Partial<UseGeminiOptions>): GenerationConfig => {
    const mergedOptions = { ...optionsRef.current, ...options };
    
    return {
      temperature: mergedOptions.temperature,
      topK: mergedOptions.topK,
      topP: mergedOptions.topP,
      maxOutputTokens: mergedOptions.maxOutputTokens,
      stopSequences: mergedOptions.stopSequences,
    };
  }, []);

  // Generate a cache key for a prompt and options
  const getCacheKey = useCallback((prompt: string, options?: Partial<UseGeminiOptions>): string => {
    const mergedOptions = { ...optionsRef.current, ...options };
    const relevantOptions = {
      model: mergedOptions.model,
      temperature: mergedOptions.temperature,
      topK: mergedOptions.topK,
      topP: mergedOptions.topP,
      maxOutputTokens: mergedOptions.maxOutputTokens,
      stopSequences: mergedOptions.stopSequences,
    };
    
    return `${prompt}|${JSON.stringify(relevantOptions)}`;
  }, []);

  // Check if a cached response is valid
  const getValidCachedResponse = useCallback((key: string): string | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    const ttl = optionsRef.current.cacheTTL || DEFAULT_OPTIONS.cacheTTL!;
    
    if (now - entry.timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.response;
  }, []);

  // Clear the error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generate text using the Gemini API
  const generateText = useCallback(async (
    prompt: string,
    options?: Partial<UseGeminiOptions>
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      // Check rate limiting
      if (checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Check cache if enabled
      const mergedOptions = { ...optionsRef.current, ...options };
      if (mergedOptions.cacheResults) {
        const cacheKey = getCacheKey(prompt, options);
        const cachedResponse = getValidCachedResponse(cacheKey);
        
        if (cachedResponse) {
          setLastResponse(cachedResponse);
          return cachedResponse;
        }
      }
      
      // Generate the text
      const model = getModel();
      const config = generateConfig(options);
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config,
        safetySettings: mergedOptions.safetySettings,
      });
      
      const response = result.response;
      const text = response.text();
      
      // Cache the result if enabled
      if (mergedOptions.cacheResults) {
        const cacheKey = getCacheKey(prompt, options);
        cacheRef.current.set(cacheKey, {
          response: text,
          timestamp: Date.now(),
        });
      }
      
      setLastResponse(text);
      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, getCacheKey, getModel, generateConfig, getValidCachedResponse]);

  // Stream text using the Gemini API
  const streamText = useCallback(async (
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: Partial<UseGeminiOptions>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Check rate limiting
      if (checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Generate the text
      const model = getModel();
      const config = generateConfig(options);
      
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config,
        safetySettings: optionsRef.current.safetySettings,
      });
      
      let fullText = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(chunkText);
      }
      
      // Cache the full response if enabled
      const mergedOptions = { ...optionsRef.current, ...options };
      if (mergedOptions.cacheResults) {
        const cacheKey = getCacheKey(prompt, options);
        cacheRef.current.set(cacheKey, {
          response: fullText,
          timestamp: Date.now(),
        });
      }
      
      setLastResponse(fullText);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, getCacheKey, getModel, generateConfig]);

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
    streamText,
    loading,
    error,
    clearError,
    lastResponse,
  };
};

export default useGemini;