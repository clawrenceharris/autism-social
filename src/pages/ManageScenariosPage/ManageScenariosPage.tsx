import { useEffect } from "react";

import { useModal, useToast } from "../../context";
import type { Scenario } from "../../types";
import {
  ConfirmationModal,
  ScenarioListItem,
  Skeleton,
} from "../../components";
import { useScenarioStore } from "../../store/useScenarioStrore";

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

const ManageScenariosRedux = () => {
  const { scenarios, error, loading, ids } = useScenarioStore();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const deleteScenario = useScenarioStore((s) => s.deleteScenario);
  useEffect(() => {
    if (error) {
      showToast(error, { type: "error" });
    }
  }, [error, showToast]);

  const handleDelete = async (scenario: Scenario) => {
    openModal(
      <ConfirmationModal
        message={`Are you sure you want to delete "${scenario.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={async () => {
          try {
            await deleteScenario(scenario.id);
            showToast("Scenario deleted successfully", { type: "success" });
          } catch {
            showToast("Failed to delete scenario", { type: "error" });
          }
        }}
      />,
      "Delete Scenario"
    );
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="scenarios-container">
        <header className="scenarios-header">
          <Skeleton variant="title" width="60%" />
          <Skeleton variant="text" width="80%" />
        </header>
        <div className="scenarios-grid">
          {[...Array(6)].map((_, index) => (
            <SkeletonScenario key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="scenarios-container">
      <header className="scenarios-header">
        <h1>Your Scenarios (Redux)</h1>
        <p className="description">
          Browse and manage your dialogue scenarios using Redux state
          management.
        </p>
      </header>

      {ids.length === 0 ? (
        <div className="no-scenarios" role="status">
          <p>No scenarios found. Create your first scenario to get started.</p>
        </div>
      ) : (
        <div
          className="scenarios-grid"
          role="list"
          aria-label="List of scenarios"
        >
          {ids.map((id) => (
            <div key={id} role="listitem">
              <ScenarioListItem
                scenario={scenarios[id]}
                onDeleteClick={() => handleDelete(scenarios[id])}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ManageScenariosRedux;
