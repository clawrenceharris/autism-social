import { useMemo } from "react";
import type { Scenario } from "../../types";
import { useScenarioStore } from "../../store/useScenarioStore";
import { Link } from "react-router-dom";
import { Award, Play } from "lucide-react";

interface ScenarioCardProps {
  scenario: Scenario;
}
const ScenarioCard = ({ scenario }: ScenarioCardProps) => {
  const { completedDialogueIds, dialoguesByScenario } = useScenarioStore();
  const isTrending = false;
  const isCompleted = useMemo(
    () =>
      Object.keys(dialoguesByScenario).every((id) =>
        completedDialogueIds.includes(id)
      ),
    [completedDialogueIds, dialoguesByScenario]
  );
  const completedDialogues = useMemo(
    () =>
      Object.keys(dialoguesByScenario).filter((id) =>
        completedDialogueIds.includes(id)
      ),
    [completedDialogueIds, dialoguesByScenario]
  );
  const totalDialogues = useMemo(
    () => Object.keys(dialoguesByScenario).length,
    [dialoguesByScenario]
  );
  if (!scenario) {
    return null;
  }
  return (
    <div
      key={scenario.id}
      className={`scenario-card ${isCompleted ? "completed" : ""} ${
        isTrending ? "trending" : ""
      }`}
    >
      <div className="card-header">
        <h3 className="scenario-title">{scenario.title}</h3>
        <div className="badges">
          {isCompleted && (
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
          <span className="meta-value">
            {(completedDialogues.length / totalDialogues) * 100}%
          </span>
          <span className="meta-label">Complete</span>
        </div>
        <div className="meta-item">
          <span className="meta-value">{completedDialogues.length}</span>
          <span className="meta-label">Finished</span>
        </div>
      </div>

      <div className="scenario-actions">
        {isCompleted ? (
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
