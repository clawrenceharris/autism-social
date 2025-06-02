import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>AN error occured: {error}</div>;
  }
  if (!scenario) {
    return <div>404 Error: Scenario not found.</div>;
  }
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
        <ScenarioForm scenario={scenario} />
      </div>
    </div>
  );
};

export default ScenarioPage;
