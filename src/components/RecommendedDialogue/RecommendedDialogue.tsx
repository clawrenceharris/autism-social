import type { Dialogue, Scenario } from "../../types";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { RecommendedScenario } from "../../services/recommendations";

interface RecommendedItemProps {
  dialogue?: Dialogue;
  scenario: RecommendedScenario;
}

const RecommendedDialogue = ({ scenario }: RecommendedItemProps) => {
  // Format match score as percentage
  const matchPercentage = Math.round(scenario.matchScore * 100);

  return (
    <div key={scenario.id} className="scenario-item recommended">
      <div className="scenario-details">
        <div className="scenario-header">
          <div className="scenario-name">{scenario.title}</div>
          <div className="match-badge">
            <Star size={14} />
            {matchPercentage}% match
          </div>
        </div>
        <div className="scenario-description">{scenario.description}</div>
        <div className="match-reasons">
          {scenario.matchReasons.map((reason, index) => (
            <span key={index} className="match-reason">
              {reason}
            </span>
          ))}
        </div>
      </div>
      {/* Updated to use the new user scenario playing route */}
      <Link to={`/play/${scenario.id}`} className="scenario-action">
        Start
      </Link>
    </div>
  );
};

export default RecommendedDialogue;