import { useScenarios } from "../../hooks";
import ScenarioListItem from "../../components/ScenarioListItem/ScenarioListItem";
import { Skeleton } from "../../components";
import { deleteScenario } from "../../services/scenarios";
import { useModal, useToast } from "../../context";
import { ConfirmationModal } from "../../components/modals";
import "./ScenariosPage.css";

const SkeletonScenario = () => (
  <div className="scenario-item">
    <div className="scenario-content">
      <Skeleton variant="title" width="80%" />
      <Skeleton variant="text" width="70%" style={{ marginBottom: "0.5rem" }} />
      <Skeleton variant="text" width="85%" />
    </div>
    <div className="scenario-actions">
      <Skeleton 
        variant="button"
        width={40} 
        height={40} 
        style={{ borderRadius: "8px" }} 
      />
      <Skeleton 
        variant="button" 
        width={40} 
        height={40} 
        style={{ borderRadius: "8px" }} 
      />
    </div>
  </div>
);

const ScenariosPage = () => {
  const { scenarios, loading, error } = useScenarios();
  const { openModal } = useModal();
  const { showToast } = useToast();

  const handleDelete = async (scenario: Scenario) => {
    openModal(
      <ConfirmationModal
        title="Delete Scenario"
        message={`Are you sure you want to delete "${scenario.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={async () => {
          try {
            await deleteScenario(scenario.id);
            showToast("Scenario deleted successfully", "success");
          } catch (error) {
            showToast("Failed to delete scenario", "error");
          }
        }}
      />,
      "Delete Scenario"
    );
  };

  if (loading) {
    return (
      <div role="status\" aria-live="polite\" className="scenarios-container">
        <header className="scenarios-header">
          <Skeleton variant="title\" width="60%" />
          <Skeleton variant="text\" width="80%" />
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
              <ScenarioListItem 
                scenario={scenario} 
                onDeleteClick={() => handleDelete(scenario)}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ScenariosPage;