import { useScenarios } from "../../hooks";
import ScenarioListItem from "../../components/ScenarioListItem/ScenarioListItem";
import "./ScenariosPage.css";

const ScenariosPage = () => {
  const { scenarios, loading, error } = useScenarios();

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="scenarios-container">
        <p className="text-center">Loading scenarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="scenarios-container">
        <p className="text-center text-red-600">An error occurred: {error}</p>
      </div>
    );
  }

  return (
    <div className="scenarios-container">
      <header className="scenarios-header">
        <h1>Scenarios</h1>
        <p className="description">Browse and manage your dialogue scenarios.</p>
      </header>

      {scenarios.length === 0 ? (
        <div className="no-scenarios">
          <p>No scenarios found. Create your first scenario to get started.</p>
        </div>
      ) : (
        <div className="scenarios-grid">
          {scenarios.map((scenario) => (
            <ScenarioListItem key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScenariosPage;