import { useState, useEffect } from "react";
import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
import type { Dialogue, DialogueStep, Scenario } from "../../types";
import { DialoguesPanel, DialogueForm } from "../../components";
import { useParams } from "react-router-dom";
import {
  getDialogueById,
  updateDialogue,
  updateScenario,
} from "../../services/scenarios";
import { dialogueSteps } from "../../constants/dialogues";
export interface ScenarioFormValues {
  scenarioTitle: string;
  dialogueTitle: string;
  personaTags: string[];
  difficulty: string;
  placeholders: string[];
  description: string;
  steps: DialogueStep[];
}
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();
  const { dialogueId } = useParams<{ dialogueId: string }>();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [dialogueError, setDialogueError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Scenario" | "Dialogue">(
    "Scenario"
  );
  const [form, setForm] = useState<ScenarioFormValues>({
    scenarioTitle: "",
    dialogueTitle: "",

    personaTags: [],
    difficulty: "easy",
    placeholders: [],
    description: "",
    steps: dialogueSteps,
  });
  useEffect(() => {
    if (!scenario) return;
    setForm((prev) => ({
      ...prev,
      scenarioTitle: scenario.title,

      description: scenario.description || "",
    }));
  }, [scenario]);
  useEffect(() => {
    if (!dialogueId) {
      setDialogue(null);
      return;
    }
    const fetchDialogue = async () => {
      try {
        const dialogue = await getDialogueById(dialogueId);
        if (!dialogue) {
          return;
        }
        setDialogue(dialogue);
        setForm((prev) => ({
          ...prev,
          dialogueTitle: dialogue.title || "",

          personaTags: dialogue.persona_tags,
          difficulty: dialogue.difficulty,
          placeholders: dialogue.placeholders,
          steps: dialogueSteps,
        }));
      } catch (err) {
        setDialogueError("Could not load this Dialogue.");
      }
    };
    fetchDialogue();
  }, [dialogueId]);

  const handleChange = (data: Partial<ScenarioFormValues>) => {
    setForm((prev) => ({ ...prev, ...data }));
  };
  const handleUpdateScenario = async (
    id: string,
    updatedFields: Partial<Scenario>
  ) => {
    try {
      await updateScenario(id, updatedFields);

      alert("Scenario updated successfully!");
    } catch (err) {
      throw err;
    }
  };
  const handleUpdateDialogue = async (
    id: string,
    updatedFields: Partial<Dialogue>
  ) => {
    try {
      await updateDialogue(id, updatedFields);

      alert("Scenario updated successfully!");
    } catch (err) {
      throw err;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario || !dialogue) {
      return;
    }
    try {
      if (activeTab === "Dialogue") {
        const {
          scenarioTitle,
          dialogueTitle,
          description,
          personaTags,
          ...rest
        } = form;
        await handleUpdateDialogue(dialogue.id, {
          title: dialogueTitle,
          persona_tags: personaTags,
          ...rest,
        });
      } else if (activeTab === "Scenario") {
        const { scenarioTitle, description } = form;
        await handleUpdateScenario(scenario.id, {
          title: scenarioTitle,
          description,
        });
      }
      alert("Updated successful!");
    } catch (err) {
      const error =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "An unknonw error occured.";
      alert(error);
      console.error(error);
    }
  };

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
    return (
      <div>
        <h1>{scenario.title}</h1>
        <DialoguesPanel scenario={scenario} /)>
      </div>
      ;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className=" scenario-header flex-content justify-between">
        <h1>Edit {activeTab}</h1>
        <div className="content-row">
          <button className="btn btn-secondary danger">Delete</button>

          <button className="btn btn-secondary primary">Update Scenario</button>
        </div>
      </div>

      <p>
        <small>ID: {scenario.id}</small>
      </p>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === "Scenario" ? "active" : ""}`}
          onClick={() => setActiveTab("Scenario")}
        >
          Scenario
        </button>
        <button
                    type="button"

          className={`tab ${activeTab === "Dialogue" ? "active" : ""}`}
          onClick={() => setActiveTab("Dialogue")}
        >
          Dialogue
        </button>
      </div>
      <div
        className={`tab-content ${activeTab === "Scenario" ? "active" : ""}`}
        style={{ display: activeTab === "Scenario" ? "block" : "none" }}
      >
        <ScenarioForm onChange={handleChange} values={form} />
      </div>

      <div
        className={`tab-content ${activeTab === "Dialogue" ? "active" : ""}`}
        style={{ display: activeTab === "Dialogue" ? "block" : "none" }}
      >
        <DialogueForm values={form} onChange={handleChange} />
      </div>
    </form>
  );
};

export default ScenarioPage;
