import { useState, useEffect } from "react";
import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
import type { Dialogue } from "../../types";
import DialoguesPanel from "../../components/DialoguesPanel";
import { useParams } from "react-router-dom";
import { getDialogueById } from "../../services/scenarios";
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
    return <div className="content-centered-absolute">Loading...</div>;
  }
  if (error || dialogueError) {
    return (
      <div className="content-centered-absolute">An error occured: {error || dialogueError}</div>
    );
  }
  if (!scenario) {
    return (
      <div className="content-centered-absolute">
        404 Error: Scenario not found.
      </div>
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
      </div>
      <ScenarioForm dailogue={dialogue} scenario={scenario} />
    </div>
  );
};

export default ScenarioPage;
