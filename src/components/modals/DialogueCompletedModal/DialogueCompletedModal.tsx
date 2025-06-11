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
  return (
    <div>
      <p className="description">
        You've completed the dialogue. Here's how you performed:
      </p>
      <div className="score-grid">
        {scores.clarity !== undefined && (
          <div className="score-item">
            <div className="score-label">Clarity</div>
            <div className="score-value">{scores.clarity}</div>
          </div>
        )}
        {scores.empathy !== undefined && (
          <div className="score-item">
            <div className="score-label">Empathy</div>
            <div className="score-value">{scores.empathy}</div>
          </div>
        )}
        {scores.assertiveness !== undefined && (
          <div className="score-item">
            <div className="score-label">Assertiveness</div>
            <div className="score-value">{scores.assertiveness}</div>
          </div>
        )}
        {scores.socialAwareness !== undefined && (
          <div className="score-item">
            <div className="score-label">Social Awareness</div>
            <div className="score-value">{scores.socialAwareness}</div>
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
