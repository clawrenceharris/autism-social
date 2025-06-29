import { useMemo } from "react";
import type { ScenarioWithDialogues } from "../../types";
import { Link } from "react-router-dom";
import { Award, Play } from "lucide-react";
import { useDialogueStore } from "../../store/useDialogueStore";
import { useProgressStore } from "../../store/useProgressStore";

interface ScenarioCardProps {
  scenario: ScenarioWithDialogues;
}
const ScenarioCard = ({ scenario }: ScenarioCardProps) => {
  const { dialoguesByScenario } = useDialogueStore();
  const { progress } = useProgressStore();
  const isTrending = false;
  const completedDialogues = useMemo(
    () =>
      scenario.dialogues.filter((d) =>
        progress.map((p) => p.dialogue_id).includes(d.id)
      ),
    [progress, scenario.dialogues]
  );
  const completionProgress = useMemo(() => {
    return Math.round(
      (completedDialogues.length /
        (scenario.dialogues.length > 0 ? scenario.dialogues.length : 1)) *
        100
    );
  }, [completedDialogues.length, scenario.dialogues.length]);

  const totalDialogues = useMemo(
    () => Object.keys(dialoguesByScenario).length,
    [dialoguesByScenario]
  );
  const isComplete = completionProgress === 100;
  if (!scenario) {
    return null;
  }
  return (
    <div
      className={`scenario-card ${isComplete ? "completed" : ""} ${
        isTrending ? "trending" : ""
      }`}
    >
      <div className="card-header">
        <h3 className="scenario-title">{scenario.title}</h3>
        <div className="badges">
          {isComplete && (
            <span className="badge completion-badge">Completed</span>
          )}
          {isTrending && <span className="badge trending-badge">Trending</span>}
        </div>
      </div>

      <p className="scenario-description">{scenario.description}</p>

      <div className="scenario-meta">
        <div className="meta-item">
          <span className="meta-value">{totalDialogues}</span>
          <span className="meta-label">Dialogues</span>
        </div>
        <div className="meta-item">
          <span className="meta-value">{completionProgress}%</span>
          <span className="meta-label">Complete</span>
        </div>
        <div className="meta-item">
          <span className="meta-value">{completedDialogues.length}</span>
          <span className="meta-label">Finished</span>
        </div>
      </div>

      <div className="scenario-actions">
        {isComplete ? (
          <>
            <Link to={`/scenario/${scenario.id}`} className="action-btn">
              <Award size={16} />
              Review
            </Link>
            <Link
              to={`/scenario/${scenario.id}`}
              className="action-btn primary"
            >
              <Play size={16} />
              Replay
            </Link>
          </>
        ) : (
          <Link to={`/scenario/${scenario.id}`} className="action-btn primary">
            <Play size={16} />
            {completedDialogues.length > 0 ? "Continue" : "Start"}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ScenarioCard;
