import { Outlet, useParams } from "react-router-dom";
import TaskBar from "../../TaskBar";
import { ScenarioProvider } from "../../../context";

const ScenarioLayout = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  if (!scenarioId) {
    return <div>No Scenario could be found</div>;
  }
  return (
    <ScenarioProvider scenarioId={scenarioId}>
      <div className="layout-container">
        <TaskBar />
        <main>
          <Outlet />
        </main>
      </div>
    </ScenarioProvider>
  );
};

export default ScenarioLayout;
