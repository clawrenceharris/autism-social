import { useState, useEffect, useCallback } from "react";
import "./EditScenarioPage.css";
import { useModal, useScenario, useToast } from "../../context";
import type { Dialogue, DialogueStep, Difficulty } from "../../types";
import {
  DialoguesPanel,
  DialogueForm,
  EditScenarioModal,
} from "../../components";
import { useParams } from "react-router-dom";
import { getDialogueById, updateDialogue } from "../../services/dialogues";
import { Pencil } from "lucide-react";

const EditScenarioPage = () => {
  const { scenario, loading, error } = useScenario();
  const { dialogueId } = useParams<{ dialogueId: string }>();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const { showToast } = useToast();
  const { openModal } = useModal();

  const [form, setForm] = useState<{
    title: string;

    persona_tags: string[];
    difficulty: Difficulty;
    placeholders: string[];
    steps: DialogueStep[];
  }>({
    title: "",

    persona_tags: [],
    difficulty: "easy",
    placeholders: [],
    steps: [],
  });

  useEffect(() => {
    if (!dialogueId) {
      setDialogue(null);
      return;
    }
    const fetchDialogue = async () => {
      try {
        const dialogue = await getDialogueById(dialogueId);

        setDialogue(dialogue);
        setForm((prev) => ({
          ...prev,
          title: dialogue.title,

          persona_tags: dialogue.persona_tags,
          difficulty: dialogue.difficulty,
          placeholders: dialogue.placeholders,
          steps: dialogue.steps,
        }));
      } catch (err) {
        showToast(err instanceof Error ? err.message : String(err), {
          type: "error",
        });
      }
    };
    fetchDialogue();
  }, [dialogueId, showToast]);

  const handleChange = useCallback((data: Partial<Dialogue>) => {
    setForm((prev) => ({ ...prev, ...data }));
  }, []);

  // const handleUpdateScenario = async (
  //   e: React.FormEvent,
  //   updatedFields: Partial<Scenario>
  // ) => {
  //   e.preventDefault();

  //   if (!scenario) {
  //     return;
  //   }
  //   try {
  //     await updateScenario(scenario.id, updatedFields);

  //     showToast("Scenario updated successfully!", "success");
  //   } catch (err) {
  //     showToast(err instanceof Error ? err.message : String(err), "error");
  //   }
  // };

  const handleUpdateDialogue = async () => {
    if (!dialogue) {
      return showToast("This Dialogue could not be found.", { type: "error" });
    }

    try {
      await updateDialogue(dialogue.id, form);
      showToast("Dialogue updated successfully!", { type: "success" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), {
        type: "error",
      });
    }
  };

  if (loading) {
    return <div className="content-centered">Loading...</div>;
  }
  if (error) {
    return <div className="content-centered">An error occured: {error}</div>;
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
        <p>
          <small>ID: {scenario.id}</small>
        </p>
        <DialoguesPanel scenario={scenario} />
      </div>
    );
  }

  return (
    <form>
      <div className=" scenario-header flex-content justify-between">
        <h1>Edit Dialogue</h1>
        <div className="content-row">
          <button className="btn btn-secondary danger">Delete Dialogue</button>

          <button
            onClick={handleUpdateDialogue}
            type="button"
            className="btn btn-secondary primary"
          >
            Update Dialogue
          </button>
        </div>
      </div>

      <p>
        <small>ID: {scenario.id}</small>
      </p>

      <div className="scenario-title">
        <div>
          <h2>Scenario: {scenario.title}</h2>
          <p>
            <small>ID: {scenario.id}</small>
          </p>
        </div>
        <button
          className="squircle-btn primary"
          onClick={() =>
            openModal(
              <EditScenarioModal scenario={scenario} />,
              "Edit Scenario"
            )
          }
        >
          <Pencil />
        </button>
      </div>

      <DialogueForm scenario={scenario} values={form} onChange={handleChange} />
    </form>
  );
};

export default EditScenarioPage;
