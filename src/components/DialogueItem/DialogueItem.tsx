import { Link } from "react-router-dom";
import type { Dialogue as DialogueType } from "../../types";
import "./DialogueItem.scss";
import { useScenarioStore } from "../../store/useScenarioStrore";
import type { ReactElement } from "react";
import { BookmarkPlus, Play } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
interface RecommendedItemProps {
  dialogue: DialogueType;
  badgeTitle?: string;
  badgeIcon?: ReactElement;
  buttonIcon?: ReactElement;
}

const DialogueItem = ({
  dialogue,
  buttonIcon,
  badgeTitle,
  badgeIcon,
}: RecommendedItemProps) => {
  const { scenarios, scenariosLoading } = useScenarioStore();
  
  if (scenariosLoading) {
    return (
      <>
        <ProgressIndicator />
      </>
    );
  }

  // Check if the scenario exists before rendering
  const scenario = scenarios[dialogue.scenario_id];
  if (!scenario) {
    return null;
  }

  return (
    <Link
      key={dialogue.id}
      className="scenario-item recommended"
      to={`/scenario/${dialogue.scenario_id}/dialogue/${dialogue.id}`}
    >
      <div className="scenario-details">
        <div className="scenario-header">
          {badgeTitle && (
            <div className="match-badge">
              {badgeIcon && badgeIcon}
              {badgeTitle}
            </div>
          )}
          <h3>{dialogue.title}</h3>
        </div>
        <div className="description">
          {scenario.description || ""}
        </div>
      </div>
      <div className="scenario-actions">
        <button className="squircle-btn primary">
          {buttonIcon || <BookmarkPlus />}
        </button>
        <button className="squircle-btn primary">
          {buttonIcon || <Play />}
        </button>
      </div>
    </Link>
  );
};

export default DialogueItem;