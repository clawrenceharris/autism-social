import type { Dialogue as DialogueType } from "../../types";
import "./DialogueItem.scss";
import { useScenarioStore } from "../../store/useScenarioStore";
import type { ReactElement } from "react";
import { BookmarkPlus, Lock, Play } from "lucide-react";
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
  const { scenarios, loading } = useScenarioStore();
  if (loading) {
    return (
      <>
        <ProgressIndicator />
      </>
    );
  }

  const scenario = scenarios[dialogue.scenario_id];
  const handlePlayClick = () => {
    if (dialogue.published === false) return;
    navigate(`/scenario/${scenario.id}/dialogue/${dialogue.id}`);
  };

  if (!scenario) {
    return null;
  }

  const isPublished = dialogue.published !== false;

  return (
    <div 
      key={dialogue.id} 
      className={`dialogue-item ${badgeTitle ? "recommended" : ""} ${!isPublished ? "unpublished" : ""}`}
      onClick={isPublished ? handlePlayClick : undefined}
    >
      {!isPublished && (
        <div className="unpublished-overlay">
          <div className="unpublished-message">
            <Lock size={16} className="lock-icon" />
            <span>This dialogue is not available yet</span>
          </div>
        </div>
      )}
      <div className="dialogue-details">
        <div className="dialogue-header">
          <div className="header-top">
            {badgeTitle && (
              <div className="badge">
                {badgeIcon && badgeIcon}
                {badgeTitle}
              </div>
            )}
            <div className="dialogue-actions">
              <button className="squircle-btn primary">
                {buttonIcon || <BookmarkPlus />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPublished) handlePlayClick();
                }}
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