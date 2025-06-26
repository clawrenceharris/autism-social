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

  const { scenarios, fetchScenarios } = useScenarioStore();
  const { dialogues, fetchDialogues, fetchDialoguesByScenario } =
    useDialogueStore();
  const { setScenario, setDialogue } = usePlayScenarioStore();
  useEffect(() => {
    if (scenarioId) {
      fetchDialoguesByScenario(scenarioId);
    }
  }, [fetchDialoguesByScenario, scenarioId]);
  useEffect(() => {
    if (scenarioId) {
      setScenario(scenarios[scenarioId]);
    } else {
      setScenario(null);
    }
    if (dialogueId) {
      setDialogue(dialogues[dialogueId]);
    } else {
      setDialogue(null);
    }
  }, [dialogueId, dialogues, scenarioId, scenarios, setDialogue, setScenario]);
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
