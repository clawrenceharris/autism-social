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
  const [activeTab, setActiveTab] = useState<'Scenario' | 'Dialogue'>('Scenario');

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
      <h1>Edit {activeTab}</h1>
      <p>
        <small>ID: {scenario.id}</small>
      </p>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'Scenario' ? 'active' : ''}`}
          onClick={() => setActiveTab('Scenario')}
        >
          Scenario
        </button>
        <button 
          className={`tab ${activeTab === 'Dialogue' ? 'active' : ''}`}
          onClick={() => setActiveTab('Dialogue')}
        >
          Dialogue
        </button>
      </div>

      <div className={`tab-content ${activeTab === 'Scenario' ? 'active' : ''}`} 
           style={{ display: activeTab === 'Scenario' ? 'block' : 'none' }}>
        <ScenarioForm scenario={scenario} />
      </div>

      <div className={`tab-content ${activeTab === 'Dialogue' ? 'active' : ''}`}
           style={{ display: activeTab === 'Dialogue' ? 'block' : 'none' }}>
        <DialogueForm dialogue={dialogue} steps={dialogueSteps} />
      </div>
    </div>
  );
};

export default ScenarioPage;