import "./ScenarioListItem.css";
import type { Scenario } from "../../types";
import { Pencil, Trash } from "lucide-react";
import { deleteScenario } from "../../services/scenarios";
import { useNavigate } from "react-router-dom";
const ScenarioListItem = ({
  scenario,
  key,
}: {
  scenario: Scenario;
  key: string;
}) => {
  const navigate = useNavigate();
  const handleDeleteClick = async () => {
    await deleteScenario(scenario.id);
  };
  const handleEditClick = () => {
    navigate(`/scenario/${scenario.id}`);
  };
  return (
    <div key={key} className="scenario-item flex-content justify-between">
      <div>
        <h2>{scenario.title}</h2>
        <p className="description">{scenario.description}</p>
      </div>
      <div className="flex-column">
        <button onClick={handleDeleteClick}>
          <Trash color="red" />
        </button>
        <button onClick={handleEditClick}>
          <Pencil color="var(--color-primary)" />
        </button>
      </div>
    </div>
  );
};

export default ScenarioListItem;
