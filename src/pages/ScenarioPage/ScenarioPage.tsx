import {useState} from "react";
import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
import type {Dialogue} from "../../types"
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="content-centered-absolute">An error occured: {error}</div>;
  }
  if (!scenario) {
    return <div>404 Error: Scenario not found.</div>;
  }
  if(!dialogue)
  return (
    <div>
      <div>
        <h1>Edit Scenario</h1>
        <p>
          {" "}
          <small>ID: {scenario.id}</small>
        </p>
      </div>
      <div className="content-body">
        <ScenarioForm dialogue={dialogue} scenario={scenario} />
      </div>
    </div>
  );
};

export default ScenarioPage;
