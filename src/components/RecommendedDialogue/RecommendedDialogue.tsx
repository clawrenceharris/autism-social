import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Dialogue } from "../../types";
import { selectScenario, useAppSelector } from "../../store/hooks";
import "./RecommendedDialogue.scss"
interface RecommendedItemProps {
  dialogue: Dialogue;
}

const RecommendedDialogue = ({ dialogue }: RecommendedItemProps) => {
  const scenario = useAppSelector(selectScenario(dialogue.scenario_id));

  return (
    <div key={dialogue.id} className="scenario-item recommended">
      <div className="scenario-details">
        <div className="scenario-header">
          <div className="scenario-name">{dialogue.title}</div>
          <div className="match-badge">
            <Star size={14} />
            Suggested
          </div>
        </div>
        <div className="scenario-description">
          {scenario?.description || ""}
        </div>
      </div>
      <Link
        to={`/scenario/${dialogue.scenario_id}/dialogue/${dialogue.id}`}
        className="scenario-action"
      >
        Start
      </Link>
    </div>
  );
};

export default RecommendedDialogue;
