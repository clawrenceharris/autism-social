import { Home, RotateCcw } from "lucide-react";
import "./DialogueCompletedModal.scss";
interface DialogueCompletedModalProps {
  scores: { [category: string]: number | undefined };
  onReplayClick: () => void;
  onExitClick: () => void;
}
const DialogueCompletedModal = ({
  scores,
  onReplayClick,
  onExitClick,
}: DialogueCompletedModalProps) => {
  const getScoreLabel = (score: number) => {
    if (score >= 80) {
      return "high";
    } else if (score >= 60) {
      return "medium";
    }
    return "low";
  };
  return (
    <div className="results-content">
      <p className="description">
        You've completed the Dialogue! Here's how you performed:
      </p>
      <div className="score-grid">
        {scores.clarity !== undefined && (
          <div className="score-item">
            <h3>Clarity</h3>
            <div className={`score-value ${getScoreLabel(scores.clarity)}`}>
              {scores.clarity}%
            </div>
          </div>
        )}
        {scores.empathy !== undefined && (
          <div className="score-item">
            <h3>Empathy</h3>
            <div className={`score-value ${getScoreLabel(scores.empathy)}`}>
              {scores.empathy}%
            </div>
          </div>
        )}
        {scores.assertiveness !== undefined && (
          <div className="score-item">
            <h3>Assertiveness</h3>
            <div
              className={`score-value ${getScoreLabel(scores.assertiveness)}`}
            >
              {scores.assertiveness}%
            </div>
          </div>
        )}
        {scores.socialAwareness !== undefined && (
          <div className="score-item">
            <h3>Social Awareness</h3>
            <div
              className={`score-value ${getScoreLabel(scores.socialAwareness)}`}
            >
              {scores.socialAwareness}%
            </div>
          </div>
        )}
      </div>

      <div className="results-actions">
        <button onClick={onReplayClick} className="btn btn-primary">
          <RotateCcw size={20} />
          Try Again
        </button>
        <button onClick={onExitClick} className="btn">
          <Home size={20} />
          Dashboard
        </button>
      </div>
    </div>
  );
};
export default DialogueCompletedModal;
