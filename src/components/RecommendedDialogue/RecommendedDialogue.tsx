import type { Dialogue, Scenario } from "../../types";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
interface RecommnendedItemProps {
  dialogue: Dialogue;
  scenario: Scenario;
}
const RecommnendedDialogue = ({
  dialogue,
  scenario,
}: RecommnendedItemProps) => {
  return (
    <div key={dialogue.id} className="scenario-item recommended">
      <div className="scenario-details">
        <div className="scenario-header">
          <div className="scenario-name">{scenario.title}</div>
          <div
            className="match-badge"
            // style={{ color: getMatchScoreColor(scenario.matchScore) }}
          >
            <Star size={14} />
            {/* {getMatchScoreText(scenario.matchScore)} */}
          </div>
        </div>
        <div className="scenario-description">{scenario.description}</div>
        <div className="match-reasons">
          {scenario.matchReasons.slice(0, 2).map((reason, index) => (
            <span key={index} className="match-reason">
              {reason}
            </span>
          ))}
        </div>
      </div>
      <Link
        to={`/scenario/${scenario.id}/dialogue/${dialogue.id}`}
        className="scenario-action"
      >
        Start
      </Link>
    </div>
  );
};

export default RecommnendedDialogue;
