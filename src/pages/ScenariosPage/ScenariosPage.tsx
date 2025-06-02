import { useScenarios } from "../../hooks";
import ScenarioListItem from "../../components/ScenarioListItem/ScenarioListItem";
import "./ScenariosPage.css";

const ScenariosPage = () => {
  const { scenarios, loading, error } = useScenarios();

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="scenarios-container">
        <div className="loading-spinner">
          <p>Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="scenarios-container">
        <div className="error-message">
          <p>An error occurred: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="scenarios-container">
      <header className="scenarios-header">
        <h1>Your Scenarios</h1>
        <p className="description">Browse and manage your dialogue scenarios.</p>
      </header>

      {scenarios.length === 0 ? (
        <div className="no-scenarios" role="status">
          <p>No scenarios found. Create your first scenario to get started.</p>
        </div>
      ) : (
        <div 
          className="scenarios-grid"
          role="list"
          aria-label="List of scenarios"
        >
          {scenarios.map((scenario) => (
            <div key={scenario.id} role="listitem">
              <ScenarioListItem scenario={scenario} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ScenariosPage;