import { useCallback, useEffect, useState } from "react";
import { useContextDialogue } from "./useContextDialogue";
import type { Actor, Dialogue, Scenario, UserProfile } from "../types";
import type { DialogueResponse, SuggestedResponse } from "../services/contextDialogue";

interface UseEnhancedDialogueOptions {
  scenario: Scenario;
  dialogue: Dialogue;
  actor: Actor;
  user?: UserProfile;
  onError?: (error: Error) => void;
}

interface UseEnhancedDialogueReturn {
  // State
  isLoading: boolean;
  error: Error | null;
  currentResponse: DialogueResponse | null;
  conversationHistory: Array<{
    id: string;
    speaker: "user" | "actor";
    content: string;
    timestamp: Date;
  }>;
  currentPhase: string;
  
  // Actions
  startDialogue: () => Promise<void>;
  submitUserInput: (input: string) => Promise<void>;
  selectSuggestedResponse: (responseId: string) => Promise<void>;
  endDialogue: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook for enhanced dialogue interactions with real-world context
 */
export const useEnhancedDialogue = ({
  scenario,
  dialogue,
  actor,
  user,
  onError,
}: UseEnhancedDialogueOptions): UseEnhancedDialogueReturn => {
  const [currentPhase, setCurrentPhase] = useState<string>("introduction");
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    speaker: "user" | "actor";
    content: string;
    timestamp: Date;
  }>>([]);
  
  const {
    contextData,
    dialogueResponse: currentResponse,
    loading: isLoading,
    error,
    fetchDialogueContext,
    generateResponse,
    clearError,
  } = useContextDialogue();

  // Fetch initial context when dialogue starts
  useEffect(() => {
    if (dialogue && scenario) {
      fetchDialogueContext(scenario, dialogue, currentPhase).catch((err) => {
        if (onError) onError(err);
      });
    }
  }, [dialogue, scenario, currentPhase, fetchDialogueContext, onError]);

  // Start the dialogue
  const startDialogue = useCallback(async () => {
    try {
      // Fetch context if not already loaded
      if (!contextData) {
        await fetchDialogueContext(scenario, dialogue, currentPhase);
      }
      
      // Generate initial actor response
      const response = await generateResponse({
        userInput: "Hello", // Initial greeting
        actor: {
          firstName: actor.first_name,
          lastName: actor.last_name,
          role: actor.role,
          bio: actor.bio,
        },
        scenario: {
          title: scenario.title,
          description: scenario.description,
        },
        dialogue: {
          title: dialogue.title,
          phase: currentPhase as any,
          scoringCategories: dialogue.scoring_categories,
        },
        conversationHistory: [],
      }, contextData || undefined);
      
      // Add actor's initial message to conversation history
      setConversationHistory([{
        id: crypto.randomUUID(),
        speaker: "actor",
        content: response.content,
        timestamp: new Date(),
      }]);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start dialogue");
      if (onError) onError(error);
    }
  }, [actor, contextData, currentPhase, dialogue, fetchDialogueContext, generateResponse, onError, scenario]);

  // Submit user input
  const submitUserInput = useCallback(async (input: string) => {
    try {
      // Add user message to conversation history
      const updatedHistory = [
        ...conversationHistory,
        {
          id: crypto.randomUUID(),
          speaker: "user",
          content: input,
          timestamp: new Date(),
        },
      ];
      
      setConversationHistory(updatedHistory);
      
      // Format conversation history for the API
      const formattedHistory = updatedHistory.map(msg => ({
        speaker: msg.speaker,
        content: msg.content,
      }));
      
      // Generate response
      const response = await generateResponse({
        userInput: input,
        actor: {
          firstName: actor.first_name,
          lastName: actor.last_name,
          role: actor.role,
          bio: actor.bio,
        },
        scenario: {
          title: scenario.title,
          description: scenario.description,
        },
        dialogue: {
          title: dialogue.title,
          phase: currentPhase as any,
          scoringCategories: dialogue.scoring_categories,
        },
        conversationHistory: formattedHistory,
      }, contextData || undefined);
      
      // Check if we should transition to next phase
      if (response.nextPhase && response.nextPhase !== currentPhase) {
        setCurrentPhase(response.nextPhase);
        
        // Fetch new context for the new phase
        fetchDialogueContext(scenario, dialogue, response.nextPhase).catch((err) => {
          if (onError) onError(err);
        });
      }
      
      // Add actor response to conversation history
      setConversationHistory([
        ...updatedHistory,
        {
          id: crypto.randomUUID(),
          speaker: "actor",
          content: response.content,
          timestamp: new Date(),
        },
      ]);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to process user input");
      if (onError) onError(error);
    }
  }, [actor, contextData, currentPhase, dialogue, fetchDialogueContext, generateResponse, conversationHistory, onError, scenario]);

  // Select a suggested response
  const selectSuggestedResponse = useCallback(async (responseId: string) => {
    try {
      if (!currentResponse) {
        throw new Error("No current response available");
      }
      
      const selectedResponse = currentResponse.suggestedUserResponses.find(
        (r: SuggestedResponse) => r.id === responseId
      );
      
      if (!selectedResponse) {
        throw new Error("Selected response not found");
      }
      
      // Use the selected response as user input
      await submitUserInput(selectedResponse.content);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to select response");
      if (onError) onError(error);
    }
  }, [currentResponse, onError, submitUserInput]);

  // End the dialogue
  const endDialogue = useCallback(() => {
    setCurrentPhase("completed");
  }, []);

  // Retry the last operation
  const retry = useCallback(async () => {
    clearError();
    
    if (conversationHistory.length === 0) {
      // If no conversation yet, start dialogue
      await startDialogue();
    } else {
      // Get the last user message
      const lastUserMessage = [...conversationHistory]
        .reverse()
        .find(msg => msg.speaker === "user");
        
      if (lastUserMessage) {
        // Remove the last actor message if it exists
        const newHistory = conversationHistory.filter(
          msg => msg.id !== conversationHistory[conversationHistory.length - 1].id
        );
        
        setConversationHistory(newHistory);
        
        // Retry with the last user message
        await submitUserInput(lastUserMessage.content);
      } else {
        // If no user message, restart dialogue
        await startDialogue();
      }
    }
  }, [clearError, conversationHistory, startDialogue, submitUserInput]);

  return {
    isLoading,
    error,
    currentResponse,
    conversationHistory,
    currentPhase,
    startDialogue,
    submitUserInput,
    selectSuggestedResponse,
    endDialogue,
    retry,
  };
};

export default useEnhancedDialogue;