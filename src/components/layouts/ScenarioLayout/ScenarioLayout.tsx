import { Outlet, useParams } from "react-router-dom";
import { useScenarioStore } from "../../../store/useScenarioStore";
import { useDialogueStore } from "../../../store/useDialogueStore";
import { useEffect } from "react";
import { usePlayScenarioStore } from "../../../store/usePlayScenarioStore";

const ScenarioLayout = () => {
  const { scenarioId, dialogueId } = useParams<{
    scenarioId: string;
    dialogueId: string;
  }>();

  const {
    scenarios,
    loading: scenariosLoading,
    fetchScenarios,
  } = useScenarioStore();
  const {
    dialogues,
    loading: dialoguesLoading,
    fetchDialogues,
    fetchDialoguesByScenario,
  } = useDialogueStore();
  const { setScenario, setDialogue } = usePlayScenarioStore();

  useEffect(() => {
    if (scenarioId && !scenariosLoading) {
      setScenario(scenarios[scenarioId]);
      // fetchDialoguesByScenario(scenarioId);
    }
    if (dialogueId && !dialoguesLoading) {
      setDialogue(dialogues[dialogueId]);
    }
  }, [
    dialogueId,
    dialogues,
    dialoguesLoading,
    fetchDialoguesByScenario,
    scenarioId,
    scenarios,
    scenariosLoading,
    setDialogue,
    setScenario,
  ]);
  useEffect(() => {
    fetchDialogues();
    fetchScenarios();
  }, [fetchDialogues, fetchScenarios]);
  return (
    <div className="layout-container">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ScenarioLayout;
