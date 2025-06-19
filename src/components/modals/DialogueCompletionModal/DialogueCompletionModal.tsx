import React, { useState } from "react";
import "./DialogueCompletionModal.scss";
import {
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

import type {
  ScoreSummary,
  ScoreCategory,
  Message,
  DialogueContext,
  Dialogue,
  Actor,
} from "../../../types";
import { useGemini } from "../../../hooks";
import {
  formatCategoryName,
  getCategoryIcon,
} from "../../../utils/categoryUtils";

interface DialogueCompletionModalProps {
  userMessages: Message[];
  actorMessages: Message[];
  dialogueContext: DialogueContext;
  dialogue: Dialogue;
  actor: Actor | null;
  userFields: { [key: string]: string } | null;
}

interface StepAnalysis {
  userResponse: string;
  actorMessage: string;
  pointsEarned: ScoreSummary;
  betterResponse?: string;
  feedback?: string;
  scoring: ScoreCategory[];
}

const DialogueCompletionModal: React.FC<DialogueCompletionModalProps> = ({
  dialogueContext,
  actor,
  userMessages,
  userFields,
  actorMessages,
  dialogue,
}) => {
  const [analysisMode, setAnalysisMode] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(
    null
  );
  const [feedback, setFeedback] = useState<string>();
  const [betterResponse, setBetterResponse] = useState<string>();

  const [loadingBetterResponse, setLoadingBetterResponse] =
    useState<boolean>(false);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const { generateText } = useGemini();
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

    .map((opt, index) => ({
      userResponse: userMessages[index]?.text || "",
      actorMessage: actorMessages[index]?.text || "",
      scoring: Object.keys(opt.scoring) as ScoreCategory[],
      pointsEarned: {
        clarity: opt.scoring.clarity,
        empathy: opt.scoring.empathy,
        assertiveness: opt.scoring.assertiveness,
        social_awareness: opt.scoring.social_awareness,
        self_advocacy: opt.scoring.self_advocacy,
      },
    }));

  const generateBetterResponse = async (
    actorMessage: string,
    userMessage: string,
    scoring: ScoreCategory[]
  ) => {
    setLoadingBetterResponse(true);

    const response =
      await generateText(`You are an AI coach helping a user improve their communication skills in real-life social situations.
                        Here is the dialogue context:
                        ${
                          actor
                            ? `- Speaker the user is responding to:  ${actor.role}`
                            : ""
                        }
                        - Scenario: ${dialogue.title}
                        - Prompt: "${actorMessage}"
                        - User Response: "${userMessage}"
                        ${
                          userFields
                            ? `- Additional User Information: ${Object.entries(
                                userFields
                              )
                                .map(
                                  ([key, value]) =>
                                    `${key.replace("_", " ")}: ${value}`
                                )
                                .join(", ")}
                        The user’s response is scored on the following categories: ${scoring
                          .join(", ")
                          .replace("_", " ")}`
                            : ""
                        }.
                        Task:
                        Write a better example of what the user could say in this situation. Make sure the new response would likely score well in the listed categories.

                        Keep the tone appropriate for the social situation.

                        Only output the improved response — no extra explanation.`);
    setLoadingBetterResponse(false);
    setBetterResponse(response);
  };

  const generateFeedback = async (
    actorMessage: string,
    userMessage: string,
    scoring: ScoreCategory[]
  ) => {
    setLoadingFeedback(true);

    const response =
      await generateText(`You are an AI coach helping a user improve their communication skills in real-life social situations.
                          Here is the dialogue context:
                          ${
                            actor
                              ? `- Speaker the user is responding to:  ${actor.role}`
                              : ""
                          }
                          - Scenario: ${dialogue.title}
                          - Prompt: "${actorMessage}"
                          - User Response: "${userMessage}"
                          The user’s response is scored on the following categories: ${scoring
                            .join(", ")
                            .replace("_", " ")}.
                          Task:
                          Give a short (2-3 sentence) helpful comment about how the user did on this response. Focus on the categories. If possible, suggest one small improvement.
                          Be friendly, supportive, and brief.`);
    setLoadingFeedback(false);
    setFeedback(response);
  };

  const toggleStepExpansion = (index: number) => {
    setExpandedStepIndex(expandedStepIndex === index ? null : index);
  };

  const totalPointsEarned = Object.values(dialogueContext.scoring).reduce(
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
              const pointsEarned = dialogueContext.scoring[category];
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

                    <p className="description">
                      <em>{getCategoryDescription(category)}</em>
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
                          <p className="message-text">
                            {analysis.actorMessage}
                            {betterResponse && (
                              <span className="description better-response">
                                {betterResponse}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            generateBetterResponse(
                              analysis.actorMessage,
                              analysis.userResponse,
                              analysis.scoring
                            )
                          }
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
                          <p className="message-text">
                            {analysis.userResponse}
                            {feedback && (
                              <span className="description feedback">
                                {feedback}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            generateFeedback(
                              analysis.actorMessage,
                              analysis.userResponse,
                              analysis.scoring
                            )
                          }
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
