import { Link } from "react-router-dom";
import type { Dialogue as DialogueType } from "../../types";
import "./DialogueItem.scss";
import { useScenarioStore } from "../../store/useScenarioStrore";
import type { ReactElement } from "react";
interface RecommendedItemProps {
  dialogue: DialogueType;
  badgeTitle?: string;
  badgeIcon?: ReactElement;
}

const DialogueItem = ({
  dialogue,
  badgeTitle,
  badgeIcon,
}: RecommendedItemProps) => {
  const { scenarios } = useScenarioStore();

  return (
    <Link
        key={dialogue.id} className="scenario-item recommended"
        to={`/scenario/${dialogue.scenario_id}/dialogue/${dialogue.id}`}
      >
      <div className="scenario-details">
        <div className="scenario-header">
          <div className="scenario-name">{dialogue.title}</div>
          {badgeTitle && (
            <div className="match-badge">
              {badgeIcon && badgeIcon}
              {badgeTitle}
            </div>
          )}
        </div>
        <div className="scenario-description">
          {scenarios[dialogue.scenario_id].description || ""}
        </div>
      </div>
      <div
        
        className="scenario-action"
      >
        Start
      </div>
    </Link>
  );
};

export default DialogueItem;