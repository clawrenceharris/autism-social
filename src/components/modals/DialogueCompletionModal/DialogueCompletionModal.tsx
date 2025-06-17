import React, { useState } from "react";
import "./DialogueCompletionModal.scss";
import {
  Eye,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
} from "lucide-react";

import type {
  ScoreSummary,
  ScoreCategory,
  DialogueStep,
  Message,
  UserMessage,
} from "../../../types";

interface DialogueCompletionModalProps {
  scores: ScoreSummary;
  dialogueSteps: DialogueStep[];
  userMessages: UserMessage[];
  actorMessages: Message[];
}

interface StepAnalysis {
  stepId: string;
  userResponse: string;
  npcMessage: string;
  pointsEarned: ScoreSummary;
  betterResponse?: string;
  feedback?: string;
}

const DialogueCompletionModal: React.FC<DialogueCompletionModalProps> = ({
  scores,
  dialogueSteps,
  userMessages,
  actorMessages,
}) => {
  const [analysisMode, setAnalysisMode] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loadingBetterResponse, setLoadingBetterResponse] = useState<
    string | null
  >(null);
  const [loadingFeedback, setLoadingFeedback] = useState<string | null>(null);

  const categories: ScoreCategory[] = [
    "clarity",
    "empathy",
    "assertiveness",
    "social_awareness",
    "self_advocacy",
  ];

  // Mock step analysis data - in real app this would come from the dialogue completion
  const stepAnalyses: StepAnalysis[] = dialogueSteps
    //ignore the last step
    .filter((_, i) => i < dialogueSteps.length - 1)
    .map((step, index) => ({
      stepId: step.id,
      userResponse: userMessages[index]?.text || "",
      npcMessage: actorMessages[index]?.text || "",
      pointsEarned: {
        clarity: userMessages[index].scoring.clarity || 0,
        empathy: userMessages[index].scoring.empathy || undefined,
        assertiveness: userMessages[index].scoring.assertiveness || undefined,
        social_awareness: userMessages[index].scoring.social_awareness,
        self_advocacy: userMessages[index].scoring.self_advocacy,
      },
    }));

  const getCategoryIcon = (category: ScoreCategory) => {
    switch (category) {
      case "clarity":
        return <MessageSquare size={16} />;
      case "empathy":
        return <Award size={16} />;
      case "assertiveness":
        return <Target size={16} />;
      case "social_awareness":
        return <Eye size={16} />;
      case "self_advocacy":
        return <TrendingUp size={16} />;
      default:
        return <Award size={16} />;
    }
  };

  const formatCategoryName = (category: ScoreCategory): string => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generateBetterResponse = async (stepId: string) => {
    setLoadingBetterResponse(stepId);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoadingBetterResponse(null);

    // In real app, this would call an AI service
    return "Here's a more effective response that demonstrates better clarity and empathy...";
  };

  const generateFeedback = async (stepId: string) => {
    setLoadingFeedback(stepId);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoadingFeedback(null);

    // In real app, this would call an AI service
    return "Your response showed good assertiveness but could benefit from more empathetic language...";
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const totalPointsEarned = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  return (
    <>
      {/* Header Section */}
      <div className="completion-header">
        <div className="success-celebration">
          <div className="success-icon">
            <Sparkles size={48} />
          </div>
          <h2 className="completion-title">Dialogue Complete!</h2>
          <p className="completion-subtitle">
            Great job! You've successfully completed this social interaction
            scenario.
          </p>
        </div>

        <div className="overall-score">
          <div className="score-breakdown">
            <div className="total-points">
              <span className="points-earned">{`${
                totalPointsEarned ? `+${totalPointsEarned}` : "N/A"
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
              const pointsEarned = scores[category];
              if (pointsEarned)
                return (
                  <div key={index} className="progress-item">
                    <div className="progress-header">
                      <div className="category-info">
                        <div className="category-icon">
                          {getCategoryIcon(category)}
                        </div>
                        <span className="category-name">
                          {formatCategoryName(category)}
                        </span>
                      </div>
                      <div className="score-display">
                        <span className="points-earned">+{pointsEarned}</span>
                      </div>
                    </div>

                    <div className="category-description">
                      {getCategoryDescription(category)}
                    </div>
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
              <div key={analysis.stepId} className="step-analysis">
                <div className="step-header">
                  <div className="step-info">
                    <span className="step-number">Step {index + 1}</span>
                    <div className="step-points">
                      {Object.entries(analysis.pointsEarned).map(
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
                    onClick={() => toggleStepExpansion(analysis.stepId)}
                    className="expand-btn"
                  >
                    {expandedStep === analysis.stepId ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>

                {expandedStep === analysis.stepId && (
                  <div className="step-details">
                    <div className="conversation-flow">
                      {/* NPC Message */}
                      <div className="message-analysis npc">
                        <div className="message-bubble">
                          <div className="message-text">
                            {analysis.npcMessage}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            generateBetterResponse(analysis.stepId)
                          }
                          className="analysis-btn better-response"
                          disabled={loadingBetterResponse === analysis.stepId}
                        >
                          <Lightbulb size={16} />
                          {loadingBetterResponse === analysis.stepId
                            ? "Generating..."
                            : "Better Response"}
                        </button>
                      </div>

                      {/* User Message */}
                      <div className="message-analysis user">
                        <div className="message-bubble">
                          <div className="message-text">
                            {analysis.userResponse}
                          </div>
                        </div>
                        <button
                          onClick={() => generateFeedback(analysis.stepId)}
                          className="analysis-btn feedback"
                          disabled={loadingFeedback === analysis.stepId}
                        >
                          <MessageSquare size={16} />
                          {loadingFeedback === analysis.stepId
                            ? "Analyzing..."
                            : "Get Feedback"}
                        </button>
                      </div>
                    </div>

                    {/* Points Breakdown */}
                    <div className="points-breakdown">
                      <h4>Points Earned This Step:</h4>
                      <div className="points-grid">
                        {Object.entries(analysis.pointsEarned).map(
                          ([category, points]) => (
                            <div
                              key={category}
                              className={`point-item ${
                                points > 0 ? "earned" : ""
                              }`}
                            >
                              {getCategoryIcon(category as ScoreCategory)}
                              <span className="category">
                                {formatCategoryName(category as ScoreCategory)}
                              </span>

                              <span className="points">{`${
                                points ? `+${points}` : "N/A"
                              }`}</span>
                            </div>
                          )
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

// Helper function for category descriptions
function getCategoryDescription(category: ScoreCategory): string {
  switch (category) {
    case "clarity":
      return "How clearly you communicated your thoughts and intentions";
    case "empathy":
      return "Your ability to understand and respond to others' emotions";
    case "assertiveness":
      return "How well you expressed your needs while respecting others";
    case "social_awareness":
      return "Your understanding of social cues and appropriate responses";
    case "self_advocacy":
      return "How effectively you stood up for yourself and your needs";
    default:
      return "";
  }
}

export default DialogueCompletionModal;
