import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  RotateCcw,
  Home,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ProgressIndicator } from "../";
import { useToast } from "../../context";
import "./DialogueCompletionModal.scss";
import {
  completeDialogue,
  type CompletionResult,
  type DialogueScores,
  type DialoguePossibleScores,
} from "../../services/dialogueCompletion";

interface DialogueCompletionModalProps {
  userId: string;
  dialogueId: string;
  scores: DialogueScores;
  possibleScores: DialoguePossibleScores;
  onReplay: () => void;
  onExit: () => void;
  isVisible: boolean;
}

interface ProgressCategory {
  key: keyof DialogueScores;
  label: string;
  previousValue: number;
  newValue: number;
  earned: number;
  possible: number;
  dialoguePercentage: number;
}

const DialogueCompletionModal: React.FC<DialogueCompletionModalProps> = ({
  userId,
  dialogueId,
  scores,
  possibleScores,
  onReplay,
  onExit,
  isVisible,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionResult, setCompletionResult] =
    useState<CompletionResult | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const { showToast } = useToast();

  const getScoreLevel = (score: number): "poor" | "good" | "excellent" => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    return "poor";
  };

  const getScoreLevelLabel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  const progressCategories: ProgressCategory[] = completionResult
    ? [
        {
          key: "clarity",
          label: "Clarity",
          previousValue: calculatePercentage(
            completionResult.previous_progress.clarity_earned,
            completionResult.previous_progress.clarity_possible
          ),
          newValue: calculatePercentage(
            completionResult.new_progress.clarity_earned,
            completionResult.new_progress.clarity_possible
          ),
          earned: scores.clarity || 0,
          possible: possibleScores.clarity,
          dialoguePercentage: calculatePercentage(
            scores.clarity || 0,
            possibleScores.clarity
          ),
        },
        {
          key: "empathy",
          label: "Empathy",
          previousValue: calculatePercentage(
            completionResult.previous_progress.empathy_earned,
            completionResult.previous_progress.empathy_possible
          ),
          newValue: calculatePercentage(
            completionResult.new_progress.empathy_earned,
            completionResult.new_progress.empathy_possible
          ),
          earned: scores.empathy || 0,
          possible: possibleScores.empathy,
          dialoguePercentage: calculatePercentage(
            scores.empathy || 0,
            possibleScores.empathy
          ),
        },
        {
          key: "assertiveness",
          label: "Assertiveness",
          previousValue: calculatePercentage(
            completionResult.previous_progress.assertiveness_earned,
            completionResult.previous_progress.assertiveness_possible
          ),
          newValue: calculatePercentage(
            completionResult.new_progress.assertiveness_earned,
            completionResult.new_progress.assertiveness_possible
          ),
          earned: scores.assertiveness || 0,
          possible: possibleScores.assertiveness,
          dialoguePercentage: calculatePercentage(
            scores.assertiveness || 0,
            possibleScores.assertiveness
          ),
        },
        {
          key: "socialAwareness",
          label: "Social Awareness",
          previousValue: calculatePercentage(
            completionResult.previous_progress.social_awareness_earned,
            completionResult.previous_progress.social_awareness_possible
          ),
          newValue: calculatePercentage(
            completionResult.new_progress.social_awareness_earned,
            completionResult.new_progress.social_awareness_possible
          ),
          earned: scores.socialAwareness || 0,
          possible: possibleScores.socialAwareness,
          dialoguePercentage: calculatePercentage(
            scores.socialAwareness || 0,
            possibleScores.socialAwareness
          ),
        },
        {
          key: "selfAdvocacy",
          label: "Self Advocacy",
          previousValue: calculatePercentage(
            completionResult.previous_progress.self_advocacy_earned,
            completionResult.previous_progress.self_advocacy_possible
          ),
          newValue: calculatePercentage(
            completionResult.new_progress.self_advocacy_earned,
            completionResult.new_progress.self_advocacy_possible
          ),
          earned: scores.selfAdvocacy || 0,
          possible: possibleScores.selfAdvocacy,
          dialoguePercentage: calculatePercentage(
            scores.selfAdvocacy || 0,
            possibleScores.selfAdvocacy
          ),
        },
      ]
    : [];

  function calculatePercentage(earned: number, possible: number): number {
    return possible > 0 ? Math.round((earned / possible) * 100) : 0;
  }

  const handleCompletion = useCallback(async () => {
    if (!isVisible || completionResult) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await completeDialogue(userId, dialogueId, scores, possibleScores);
      setCompletionResult(result);

      // Start animations after a brief delay
      setTimeout(() => {
        setAnimationStarted(true);
      }, 500);

      showToast("Dialogue completed successfully! 🎉", { type: "success" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete dialogue";
      setError(errorMessage);
      showToast(errorMessage, { type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [completionResult, dialogueId, isVisible, scores, possibleScores, showToast, userId]);

  const handleRetry = () => {
    setError(null);
    setCompletionResult(null);
    setAnimationStarted(false);
    handleCompletion();
  };

  useEffect(() => {
    if (isVisible && !completionResult && !isLoading && !error) {
      handleCompletion();
    }
  }, [completionResult, error, handleCompletion, isLoading, isVisible]);

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <div className="completion-modal">
        <div className="loading-state">
          <ProgressIndicator size={60} />
          <p className="loading-text">Saving your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="completion-modal">
        <div className="error-state">
          <AlertCircle className="error-icon" />
          <h3 className="error-title">Completion Failed</h3>
          <p className="error-message">{error}</p>
          <button onClick={handleRetry} className="retry-btn">
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!completionResult) return null;

  return (
    <div className="completion-modal">
      <div className="completion-header">
        <div className="success-icon">
          <CheckCircle />
        </div>
        <h2 className="completion-title">Dialogue Complete!</h2>
        <p className="completion-subtitle">
          Great job! You've successfully completed this social interaction
          scenario. Here's how you performed:
        </p>
      </div>

      <div className="progress-section">
        <h3 className="section-title">Your Performance</h3>
        <div className="progress-categories">
          {progressCategories.map((category) => (
            <div key={category.key} className="progress-item">
              <div className="progress-header">
                <span className="category-name">{category.label}</span>
                <div className="score-display">
                  <span className="dialogue-score">
                    {category.earned}/{category.possible} pts
                  </span>
                  <span
                    className={`current-score ${getScoreLevel(
                      category.newValue
                    )}`}
                  >
                    {category.newValue}%
                  </span>
                </div>
              </div>
              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getScoreLevel(category.newValue)}`}
                  style={{
                    width: animationStarted
                      ? `${category.newValue}%`
                      : `${category.previousValue}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={category.newValue}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${category.label}: ${
                    category.newValue
                  }% - ${getScoreLevelLabel(category.newValue)}`}
                >
                  <span className="progress-percentage">
                    {category.newValue}%
                  </span>
                </div>
              </div>
              <div className="dialogue-performance">
                <span className="performance-label">This dialogue:</span>
                <span className={`performance-score ${getScoreLevel(category.dialoguePercentage)}`}>
                  {category.dialoguePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="completion-actions">
        <button onClick={onReplay} className="action-btn secondary">
          <RotateCcw size={20} />
          Try Again
        </button>
        <button onClick={onExit} className="action-btn primary">
          <Home size={20} />
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default DialogueCompletionModal;