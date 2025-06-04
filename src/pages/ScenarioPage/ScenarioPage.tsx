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
  const [activeTab, setActiveTab] = useState<'scenario' | 'dialogue'>('scenario');

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
    <div className="container">
      <h1>Edit Scenario</h1>
      <p>
        <small>ID: {scenario.id}</small>
      </p>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'scenario' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenario')}
        >
          Edit Scenario
        </button>
        <button 
          className={`tab ${activeTab === 'dialogue' ? 'active' : ''}`}
          onClick={() => setActiveTab('dialogue')}
        >
          Edit Dialogue
        </button>
      </div>

      <div className={`tab-content ${activeTab === 'scenario' ? 'active' : ''}`} 
           style={{ display: activeTab === 'scenario' ? 'block' : 'none' }}>
        <ScenarioForm dailogue={dialogue} scenario={scenario} />
      </div>

      <div className={`tab-content ${activeTab === 'dialogue' ? 'active' : ''}`}
           style={{ display: activeTab === 'dialogue' ? 'block' : 'none' }}>
        <DialogueForm steps={dialogueSteps} />
      </div>
    </div>
  );
};

export default ScenarioPage;