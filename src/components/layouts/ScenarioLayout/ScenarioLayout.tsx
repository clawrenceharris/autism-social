import { Outlet, useParams } from "react-router-dom";
import { ScenarioProvider } from "../../../context";

const ScenarioLayout = () => {
  const { scenarioId, dialogueId } = useParams<{
    scenarioId: string;
    dialogueId: string;
  }>();
  
  return (
    <ScenarioProvider dialogueId={dialogueId} scenarioId={scenarioId}>
      <div className="layout-container">
        <div>
          <Outlet />
        </div>
      </div>
    </ScenarioProvider>
  );
};

export default ScenarioLayout;
