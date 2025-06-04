import { useState, useEffect } from "react";
import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
import type { Dialogue } from "../../types";
import { DialoguesPanel, DialogueForm } from "../../components";
import { useParams } from "react-router-dom";
import { getDialogueById } from "../../services/scenarios";
import { dialogueSteps } from "../../constants/dialogues";
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();
  const { dialogueId } = useParams<{ dialogueId: string }>();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [dialogueError, setDialogueError] = useState<string | null>(null);
  useEffect(() => {
    if (!dialogueId) {
      setDialogue(null);
      return;
    }
    const fetchDialogue = async () => {
      try {
        const dialogue = await getDialogueById(dialogueId);
        if (dialogue) setDialogue(dialogue);
      } catch (err) {
        setDialogueError("Could not load this Dialogue.");
      }
    };
    fetchDialogue();
  }, [dialogueId]);

  if (loading) {
    return <div className="content-centered">Loading...</div>;
  }
  if (error || dialogueError) {
    return (
      <div className="content-centered">
        An error occured: {error || dialogueError}
      </div>
    );
  }
  if (!scenario) {
    return (
      <div className="content-centered">404 Error: Scenario not found.</div>
    );
  }
  if (!dialogue) {
    return <DialoguesPanel scenario={scenario} />;
  }
  return (
    <div>
        <div>
          <h1>Edit Scenario</h1>
          <p>
            {" "}
            <small>ID: {scenario.id}</small>
          </p>
         
         <ScenarioForm dailogue={dialogue} scenario={scenario} />
        <DialogueForm steps={dialogueSteps} />
    </div>
  );
};

export default ScenarioPage;
