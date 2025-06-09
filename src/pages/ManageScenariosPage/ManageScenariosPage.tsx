import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchScenarios,
  deleteScenario,
  selectAllScenarios,
  selectScenariosLoading,
  selectScenariosError,
  clearError,
} from "../../store/slices/scenariosSlice";
import { addToast } from "../../store/slices/uiSlice";
import { useModal } from "../../context";
import type { Scenario } from "../../types";
import {
  ConfirmationModal,
  ScenarioListItem,
  Skeleton,
} from "../../components";

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
  const dispatch = useAppDispatch();
  const scenarios = useAppSelector(selectAllScenarios);
  const loading = useAppSelector(selectScenariosLoading);
  const error = useAppSelector(selectScenariosError);
  const { openModal } = useModal();

  useEffect(() => {
    dispatch(fetchScenarios());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(addToast({ message: error, type: "error" }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = async (scenario: Scenario) => {
    openModal(
      <ConfirmationModal
        message={`Are you sure you want to delete "${scenario.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={async () => {
          try {
            await dispatch(deleteScenario(scenario.id)).unwrap();
            dispatch(
              addToast({
                message: "Scenario deleted successfully",
                type: "success",
              })
            );
          } catch (error) {
            console.error(error);
            dispatch(
              addToast({
                message: "Failed to delete scenario",
                type: "error",
              })
            );
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

      {scenarios?.length === 0 ? (
        <div className="no-scenarios" role="status">
          <p>No scenarios found. Create your first scenario to get started.</p>
        </div>
      ) : (
        <div
          className="scenarios-grid"
          role="list"
          aria-label="List of scenarios"
        >
          {scenarios?.map((scenario) => (
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

export default ManageScenariosRedux;
