import "./ScenarioListItem.css";
import type { Scenario } from "../../types";
import { Pencil, Trash } from "lucide-react";
const ScenarioListItem = ({ scenario }: { scenario: Scenario }) => {
  return (
    <div className="card flex-content justify-between">
      <div>
        <h2>{scenario.title}</h2>
        <p className="description">{scenario.description}</p>
      </div>
      <div className="flex-column">
        <Trash />
        <Pencil />
      </div>
    </div>
  );
};

export default ScenarioListItem;
