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
  useEffect(() => {
    if (!dialogueId) {
      return;
    }
    const fetchDialogue = async () => {
      try {
        const dialogue = await getDialogueById(dialogueId);
        if (dialogue) setDialogue(dialogue);
      } catch (err) {
        alert("Could not load the Dialogue");
      }
    };
    fetchDialogue();
  });
  if (loading) {
    return <div className="content-centered-absolute">Loading...</div>;
  }
  if (error) {
    return (
      <div className="content-centered-absolute">An error occured: {error}</div>
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
    return (
      <DialoguesPanel
        onDialogueClick={(dialogue) => setDialogue(dialogue)}
        scenario={scenario}
      />
    );
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
