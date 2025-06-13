import { Outlet, useParams } from "react-router-dom";
import { ScenarioProvider } from "../../../context";

const ScenarioRoute = () => {
  const { scenarioId, dialogueId } = useParams<{
    scenarioId: string;
    dialogueId: string;
  }>();

  return (
    <ScenarioProvider dialogueId={dialogueId} scenarioId={scenarioId}>
      <Outlet />
    </ScenarioProvider>
  );
};

export default ScenarioRoute;
