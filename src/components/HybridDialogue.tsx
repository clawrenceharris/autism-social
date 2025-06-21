import React, { useState } from "react";
import { Send, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { Actor, ScoreCategory, ScoreSummary, UserProfile } from "../types";
import useDynamicDialogue from "../hooks/useDynamicDialogue";

interface HybridDialogueProps {
  scenarioTitle: string;
  dialogueTitle: string;
  actor: Actor;
  user: UserProfile;
  onDialogueComplete?: (finalScores: ScoreSummary) => void;
  onError?: (error: string) => void;
}

export const HybridDialogue: React.FC<HybridDialogueProps> = ({
  scenarioTitle,
  dialogueTitle,
  actor,
  user,
  onDialogueComplete,
  onError,
}) => {
  const [userInput, setUserInput] = useState("");

  const {
    startDialogue,
    submitUserInput,
    selectSuggestedResponse,
    endDialogue,
    retry,
    isLoading,
    isWaitingForUser,
    isCompleted,
    hasError,
    currentActorResponse,
    currentUserAnalysis,
    conversationHistory,
    currentPhase,
    context,
  } = useDynamicDialogue({
    scenarioTitle,
    dialogueTitle,
    actor,
    user,
    onDialogueComplete,
    onError,
  });

  const handleSubmitInput = () => {
    if (userInput.trim()) {
      submitUserInput(userInput.trim());
      setUserInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInput();
    }
  };

  const handleSuggestedResponse = (responseId: string) => {
    selectSuggestedResponse(responseId);
  };

  // Show start screen
  if (context.conversationHistory.length === 0 && !isLoading) {
    return (
      <div className="hybrid-dialogue">
        <div className="dialogue-header">
          <h2>{dialogueTitle}</h2>
          <p className="scenario-title">{scenarioTitle}</p>
          <div className="actor-info">
            <strong>
              {actor.first_name} {actor.last_name}
            </strong>
            <p>{actor.bio}</p>
          </div>
        </div>

        <div className="start-dialogue">
          <p>Ready to start your conversation with {actor.first_name}?</p>
          <button
            className="btn btn-primary"
            onClick={startDialogue}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Start Dialogue"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hybrid-dialogue">
      <div className="dialogue-header">
        <h2>{dialogueTitle}</h2>
        <div className="phase-indicator">
          <span className="current-phase">
            {currentPhase.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="conversation-container">
        {/* Conversation History */}
        <div className="conversation-history">
          {conversationHistory.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.speaker === "user" ? "user-message" : "actor-message"
              }`}
            >
              <div className="message-header">
                <span className="speaker">
                  {message.speaker === "user" ? "You" : actor.first_name}
                </span>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
              {message.scores && (
                <div className="message-scores">
                  <small>
                    Clarity: {message.scores.clarity}/10, Empathy:{" "}
                    {message.scores.empathy}/10, Assertiveness:{" "}
                    {message.scores.assertiveness}/10
                  </small>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="message actor-message loading">
              <div className="message-header">
                <span className="speaker">{actor.first_name}</span>
              </div>
              <div className="message-content">
                <Loader2 className="animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* User Input Area */}
        {isWaitingForUser && !isCompleted && (
          <div className="user-input-area">
            {/* Current User Analysis Feedback */}
            {currentUserAnalysis && (
              <div className="user-feedback">
                <h4>Feedback on your last response:</h4>
                <p>{currentUserAnalysis.feedback}</p>
                {currentUserAnalysis.strengths.length > 0 && (
                  <div className="strengths">
                    <strong>Strengths:</strong>
                    <ul>
                      {currentUserAnalysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentUserAnalysis.improvements.length > 0 && (
                  <div className="improvements">
                    <strong>Areas for improvement:</strong>
                    <ul>
                      {currentUserAnalysis.improvements.map(
                        (improvement, index) => (
                          <li key={index}>{improvement}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Suggested Responses */}
            {currentActorResponse?.suggestedUserResponses && (
              <div className="suggested-responses">
                <h4>Suggested responses:</h4>
                <div className="response-options">
                  {currentActorResponse.suggestedUserResponses.map(
                    (response) => (
                      <button
                        key={response.id}
                        className="suggested-response"
                        onClick={() => handleSuggestedResponse(response.id)}
                      >
                        <div className="response-content">
                          {response.content}
                        </div>
                        <div className="response-reasoning">
                          <small>{response.reasoning}</small>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Free-form Input */}
            <div className="free-form-input">
              <h4>Or type your own response:</h4>
              <div className="input-container">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response here..."
                  rows={3}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubmitInput}
                  disabled={!userInput.trim() || isLoading}
                  className="send-button"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>

            <div className="dialogue-actions">
              <button className="btn btn-secondary" onClick={endDialogue}>
                End Dialogue
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="error-state">
            <AlertCircle className="error-icon" />
            <p>Something went wrong: {context.error}</p>
            <button className="btn btn-primary" onClick={retry}>
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Completion State */}
        {isCompleted && (
          <div className="completion-state">
            <h3>Dialogue Complete!</h3>
            <p>
              Great job practicing your social skills with {actor.first_name}.
            </p>

            <div className="final-scores">
              <h4>Your Performance:</h4>
              <div className="score-breakdown">
                {Object.entries(context.totalScores).map(
                  ([category, score]) => (
                    <div key={category} className="score-item">
                      <span className="category">
                        {category.replace("_", " ")}
                      </span>
                      <span className="score">
                        {score}/
                        {context.maxPossibleScores[category as ScoreCategory]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridDialogue;
