import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { RecommendedDialogue as RecommendedDialogueType } from "../../types";

interface RecommendedItemProps {
  dialogue: RecommendedDialogueType;
}

const RecommendedDialogue = ({ dialogue }: RecommendedItemProps) => {
  // Format match score as percentage
  const matchPercentage = Math.round(dialogue.matchScore * 100);

  return (
    <div key={dialogue.id} className="scenario-item recommended">
      <div className="scenario-details">
        <div className="scenario-header">
          <div className="scenario-name">{dialogue.title}</div>
          <div className="match-badge">
            <Star size={14} />
            {matchPercentage}% match
          </div>
        </div>
        <div className="scenario-description">{dialogue.scenario_id}</div>
        <div className="match-reasons">
          {dialogue.matchReasons.map((reason, index) => (
            <span key={index} className="match-reason">
              {reason}
            </span>
          ))}
        </div>
      </div>
      {/* Updated to use the new user scenario playing route */}
      <Link
        to={`/play/${dialogue.scenario_id}/dialogue/${dialogue.id}`}
        className="scenario-action"
      >
        Start
      </Link>
    </div>
  );
};

export default RecommendedDialogue;
