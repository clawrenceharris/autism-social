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
  Message,
  DialogueContext,
} from "../../../types";

interface DialogueCompletionModalProps {
  userMessages: Message[];
  actorMessages: Message[];
  dialogueContext: DialogueContext;
}

interface StepAnalysis {
  userResponse: string;
  npcMessage: string;
  pointsEarned: ScoreSummary;
  betterResponse?: string;
  feedback?: string;
}

const DialogueCompletionModal: React.FC<DialogueCompletionModalProps> = ({
  dialogueContext,

  userMessages,
  actorMessages,
}) => {
  const [analysisMode, setAnalysisMode] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(
    null
  );
  const [loadingBetterResponse, setLoadingBetterResponse] =
    useState<boolean>(false);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);

  const categories: ScoreCategory[] = [
    "clarity",
    "empathy",
    "assertiveness",
    "social_awareness",
    "self_advocacy",
  ];

  // Mock step analysis data - in real app this would come from the dialogue completion
  const stepAnalyses: StepAnalysis[] = dialogueContext.path
    //ignore the last step
    .filter((_, i) => i < dialogueContext.path.length - 1)
    .map((opt, index) => ({
      userResponse: userMessages[index]?.text || "",
      npcMessage: actorMessages[index]?.text || "",
      pointsEarned: {
        clarity: opt.scoring.clarity,
        empathy: opt.scoring.empathy,
        assertiveness: opt.scoring.assertiveness,
        social_awareness: opt.scoring.social_awareness,
        self_advocacy: opt.scoring.self_advocacy,
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

  const generateBetterResponse = async () => {
    setLoadingBetterResponse(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoadingBetterResponse(false);

    return "Here's a more effective response that demonstrates better clarity and empathy...";
  };

  const generateFeedback = async () => {
    setLoadingFeedback(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoadingFeedback(false);

    return "Your response showed good assertiveness but could benefit from more empathetic language...";
  };

  const toggleStepExpansion = (index: number) => {
    setExpandedStepIndex(expandedStepIndex === index ? null : index);
  };

  const totalPointsEarned = Object.values(dialogueContext.scores).reduce(
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
              const pointsEarned = dialogueContext.scores[category];
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
              <div key={index} className="step-analysis">
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
                          <div className="message-text">
                            {analysis.npcMessage}
                          </div>
                        </div>
                        <button
                          onClick={() => generateBetterResponse()}
                          className="analysis-btn better-response"
                          disabled={loadingBetterResponse}
                        >
                          <Lightbulb size={16} />
                          {loadingBetterResponse
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
                          onClick={() => generateFeedback()}
                          className="analysis-btn feedback"
                          disabled={loadingFeedback}
                        >
                          <MessageSquare size={16} />
                          {loadingFeedback ? "Analyzing..." : "Get Feedback"}
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
