import type { Dialogue, Scenario } from "../../types";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface RecommendedItemProps {
  dialogue?: Dialogue;
  scenario: Scenario;
}

const RecommendedDialogue = ({ scenario }: RecommendedItemProps) => {
  return (
    <div key={scenario.id} className="scenario-item recommended">
      <div className="scenario-details">
        <div className="scenario-header">
          <div className="scenario-name">{scenario.title}</div>
          <div className="match-badge">
            <Star size={14} />
            {/* Match score would go here */}
          </div>
        </div>
        <div className="scenario-description">{scenario.description}</div>
        <div className="match-reasons">
          {/* Match reasons would go here */}
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