import type { Dialogue as DialogueType } from "../../types";
import "./DialogueItem.scss";
import { useScenarioStore } from "../../store/useScenarioStrore";
import type { ReactElement } from "react";
import { BookmarkPlus, Play } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { scenarios, scenariosLoading } = useScenarioStore();
  if (scenariosLoading) {
    return (
      <>
        <ProgressIndicator />
      </>
    );
  }

  const scenario = scenarios[dialogue.scenario_id];
  const handlePlayClick = () => {
    navigate(`/scenario/${scenario.id}/dialogue/${dialogue.id}`);
  };

  if (!scenario) {
    return null;
  }

  return (
    <div key={dialogue.id} className="dialogue-item recommended">
      <div className="dialogue-details">
        <div className="dialogue-header">
          <div className="header-top">
            {badgeTitle && (
              <div className="match-badge">
                {badgeIcon && badgeIcon}
                {badgeTitle}
              </div>
            )}
            <div className="dialogue-actions">
              <button className="squircle-btn primary">
                {buttonIcon || <BookmarkPlus />}
              </button>
              <button
                onClick={handlePlayClick}
                className="squircle-btn primary"
              >
                {buttonIcon || <Play />}
              </button>
            </div>
          </div>

          <h3>{dialogue.title}</h3>
        </div>
        <div className="description">{scenario.description || ""}</div>
      </div>
    </div>
  );
};

export default DialogueItem;
