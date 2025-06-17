import React from "react";
import "./DialogueCompletionModal.scss";

import type { ScoreSummary, ScoreCategory } from "../../types";
import { useProgressStore } from "../../store/useProgressStore";
// import { addDialogueProgress } from "../../services/dialogues";

interface DialogueCompletionModalProps {
  userId: string;
  dialogueId: string;
  scores: ScoreSummary;
}

const DialogueCompletionModal: React.FC<DialogueCompletionModalProps> = ({
  // userId,
  dialogueId,
  scores,
}) => {
  const { progressByDialogueId } = useProgressStore();
  const categories: ScoreCategory[] = [
    "clarity",
    "empathy",
    "assertiveness",
    "social_awareness",
    "self_advocacy",
  ];

  const getScoreLevel = (score: number): "poor" | "good" | "excellent" => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    return "poor";
  };

  // const getScoreLevelLabel = (score: number): string => {
  //   if (score >= 80) return "Excellent";
  //   if (score >= 60) return "Good";
  //   return "Needs Work";
  // };

  const getPreviousValue = (category: ScoreCategory) =>
    progressByDialogueId[dialogueId]?.length
      ? progressByDialogueId[dialogueId][
          progressByDialogueId[dialogueId].length - 1
        ][category]
      : 0;

  return (
    <div className="completion-modal">
      <div className="progress-section">
        <div className="progress-categories">
          {categories.map((category, index) => (
            <div key={index} className="progress-item">
              <div className="progress-header">
                <span className="category-name">{category}</span>
                <div className="score-display">
                  <span className="dialogue-score">View Details</span>

                  <span
                    className={`current-score ${getScoreLevel(
                      getPreviousValue(category)
                    )}`}
                  >
                    +{scores[category]} pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DialogueCompletionModal;
