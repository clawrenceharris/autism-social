import React, { useState } from "react";
import "./DialogueCompletionModal.scss";
import { Lightbulb, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

import type {
  ScoreSummary,
  ScoreCategory,
  Dialogue,
  Actor,
} from "../../../types";
import {
  formatCategoryName,
  getCategoryIcon,
} from "../../../utils/categoryUtils";
import type { ConversationMessage } from "../../../services/dynamicDialogue";
import type { DialogueContext } from "../../../xstate/dialogueMachine";
import { useScoreCategoryStore } from "../../../store/useScoreCategoryStore";

interface DialogueCompletionModalProps {
  userMessages: ConversationMessage[];
  actorMessages: ConversationMessage[];
  context: DialogueContext;
  dialogue: Dialogue;
  actor: Actor | null;
}

interface StepAnalysis {
  userResponse: string;
  actorMessage: string;
  scores: ScoreSummary;
  betterResponse?: string;
  feedback?: string;
}
const DialogueCompletionModal: React.FC<DialogueCompletionModalProps> = ({
  context,
  userMessages,
  actorMessages,
}) => {
  const [analysisMode, setAnalysisMode] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [showBetterResponse, setShowBetterResponse] = useState<number | null>(
    null
  );

  const { categories } = useScoreCategoryStore();

  // Mock step analysis data - in real app this would come from the dialogue completion
  const stepAnalyses: StepAnalysis[] = userMessages
    //ignore the last step

    .map((userMessage, index) => ({
      userResponse: userMessage.content,
      actorMessage: actorMessages[index].content,
      feedback: userMessage.analysis?.feedback,
      betterResponse: userMessage.analysis?.betterResponse,

      scores: userMessage.analysis?.scores || {},
    }));
  const generateBetterResponse = (index: number) => {
    setShowBetterResponse(index);
  };

  const generateFeedback = async (index: number) => {
    setShowFeedback(index);
  };

  const toggleStepExpansion = (index: number) => {
    setExpandedStepIndex(expandedStepIndex === index ? null : index);
    setShowBetterResponse(null);
    setShowFeedback(null);
  };

  const totalPointsEarned = Object.values(context.totalScores).reduce(
    (sum, score) => sum + (score || 0),
    0
  );

  return (
    <>
      {/* Header Section */}
      <div className="completion-header">
        <div className="success-celebration">
          <h2 className="completion-title">Dialogue Complete!</h2>
          <p className="completion-subtitle">
            Great job! You've successfully completed this Dialogue.
          </p>
        </div>

        <div className="overall-score">
          <div className="score-breakdown">
            <div className="total-points">
              <span className="points-earned">{`${
                totalPointsEarned !== undefined
                  ? `+${totalPointsEarned}`
                  : "N/A"
              }`}</span>
              <span className="points-label">Total Points Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Toggle */}
      <div className="analysis-toggle">
        <button
          onClick={() => setAnalysisMode(!analysisMode)}
          className={`toggle-btn ${analysisMode ? "active" : ""}`}
        >
          <Lightbulb />
          {analysisMode ? "Hide Analysis" : "Show Detailed Analysis"}
        </button>
      </div>

      {/* Progress Section */}
      {!analysisMode && (
        <div className="progress-section">
          <h3 className="section-title">Your Performance Breakdown</h3>
          <div className="progress-categories">
            {categories.map((category, index) => {
              const pointsEarned =
                context.totalScores[
                  category.name.toLowerCase().replace(" ", "_") as ScoreCategory
                ];
              if (pointsEarned)
                return (
                  <div key={index} className="progress-item">
                    <div className="progress-header">
                      <div className="category-info">
                        <div className="category-icon">
                          {getCategoryIcon(category.name)}
                        </div>
                        <span className="category-name">
                          {formatCategoryName(category.name)}
                        </span>
                      </div>
                      <div className="score-display">
                        <span className="points-earned">+{pointsEarned}</span>
                      </div>
                    </div>

                    <p className="description">
                      <em>{category.description}</em>
                    </p>
                  </div>
                );
            })}
          </div>
        </div>
      )}

      {/* Detailed Analysis Section */}
      {analysisMode && (
        <div className="analysis-section">
          <h3 className="section-title">
            <MessageSquare size={20} />
            Step-by-Step Analysis
          </h3>

          <div className="steps-analysis">
            {stepAnalyses.map((analysis, index) => (
              <div onClick={() =>toggleStepExpansion(index)} key={index} className="step-analysis">
                <div className="step-header">
                  <div className="step-info">
                    <span className="step-number">Step {index + 1}</span>
                    <div className="step-points">
                      {Object.entries(analysis.scores).map(
                        ([cat, points]) =>
                          points > 0 && (
                            <span key={cat} className="point-badge">
                              {getCategoryIcon(cat as ScoreCategory)}+{points}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStepExpansion(index)}
                    className="expand-btn"
                  >
                    {expandedStepIndex === index ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>

                {expandedStepIndex === index && (
                  <div className="step-details">
                    <div className="conversation-flow">
                      {/* NPC Message */}
                      <div className="message-analysis npc">
                        <div className="message-bubble">
                          <p className="message-text">
                            {analysis.actorMessage}
                            {showBetterResponse === index && (
                              <span className="description better-response">
                                {analysis.betterResponse ||
                                  "Better response is not available."}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            generateBetterResponse(expandedStepIndex)
                          }
                          className="analysis-btn better-response"
                        >
                          <Lightbulb size={16} />
                          Better Response
                        </button>
                      </div>

                      {/* User Message */}
                      <div className="message-analysis user">
                        <div className="message-bubble">
                          <p className="message-text">
                            {analysis.userResponse}
                            {showFeedback === index && (
                              <span className="description feedback">
                                {analysis.feedback ||
                                  "Feedback is not available for this response."}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => generateFeedback(expandedStepIndex)}
                          className="analysis-btn feedback"
                        >
                          <MessageSquare size={16} />
                          Feedback
                        </button>
                      </div>
                    </div>

                    {/* Points Breakdown */}
                    <div className="points-breakdown">
                      <h4>Points Earned This Step:</h4>
                      <div className="points-grid">
                        {Object.entries(analysis.scores).map(
                          ([category, points]) =>
                            points !== undefined ? (
                              <div
                                key={category}
                                className={`point-item ${
                                  points > 0 ? "earned" : ""
                                }`}
                              >
                                {getCategoryIcon(category as ScoreCategory)}
                                <span className="category">
                                  {formatCategoryName(
                                    category as ScoreCategory
                                  )}
                                </span>

                                <span className="points">+{points}</span>
                              </div>
                            ) : null
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DialogueCompletionModal;
