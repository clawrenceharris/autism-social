import { useScenarios } from "../../hooks";
import ScenarioListItem from "../../components/ScenarioListItem/ScenarioListItem";
import "./ScenariosPage.css";

const SkeletonScenario = () => (
  <div className="scenario-item">
    <div className="scenario-content">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '70%' }} />
      <div className="skeleton skeleton-text" style={{ width: '85%' }} />
    </div>
    <div className="scenario-actions">
      <div className="skeleton skeleton-button" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
      <div className="skeleton skeleton-button" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
    </div>
  </div>
);

const ScenariosPage = () => {
  const { scenarios, loading, error } = useScenarios();

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="scenarios-container">
        <header className="scenarios-header">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
        </header>
        <div className="scenarios-grid">
          {[...Array(6)].map((_, index) => (
            <SkeletonScenario key={index} />
          ))}
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