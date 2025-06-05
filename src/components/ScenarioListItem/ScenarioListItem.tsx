import "./ScenarioListItem.css";
import type { Scenario } from "../../types";
import { Pencil, Trash2 } from "lucide-react";
import { deleteScenario } from "../../services/scenarios";
import { useNavigate } from "react-router-dom";
interface ScenarioListItemProps{
    scenario: Scenario;
    onDeleteClick: () => void;
}
const ScenarioListItem = ({ scenario, onDeleteClick }: ScenarioListItemProps) => {
  const navigate = useNavigate();
  
  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this scenario?")) {
      await deleteScenario(scenario.id);
    }
  };

  const handleEditClick = () => {
    navigate(`/scenario/${scenario.id}`);
  };

  return (
    <article className="scenario-item">
      <div className="scenario-content">
        <h2 className="scenario-title">{scenario.title}</h2>
        <p className="scenario-description">{scenario.description}</p>
      </div>
      <div className="scenario-actions">
        <button
          onClick={handleEditClick}
          className="squircle-btn primary"
          aria-label={`Edit ${scenario.title}`}
        >
          <Pencil size={20} aria-hidden="true" />
        </button>
        <button
          onClick={onDeleteClick}
          className="squircle-btn danger"
          aria-label={`Delete ${scenario.title}`}
        >
          <Trash2 size={20} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default ScenarioListItem;