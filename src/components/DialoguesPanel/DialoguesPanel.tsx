import "./DialoguesPanel.css";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import type { Scenario } from "../../types";
import { useModal } from "../../context";
import { CreateDialogueModal } from "../";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useDialogueStore } from "../../store/useDialogueStore";
interface DialoguesPanelProps {
  scenario: Scenario;
}

const DialoguesPanel = ({ scenario }: DialoguesPanelProps) => {
  const {
    scenarioDialogues: dialogues,
    ids,
    loading,
    error,
  } = useDialogueStore();
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>(
    null
  );
  const { openModal, closeModal } = useModal();

  const handleSelectDialogue = (id: string) => {
    if (selectedDialogueId === id) {
      return setSelectedDialogueId(null);
    }
    setSelectedDialogueId(id);
  };
  if (loading) {
    return (
      <div className="content-centered">
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="content-centered">
        <h1>An Error occurred</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="outlined flex-column dialogues-container">
      {ids.length > 0 ? (
        <div>
          {ids.map((id) => (
            <div key={id} className="dialogue-item ">
              <button
                onClick={() => handleSelectDialogue(id)}
                className={`squircle-btn ${
                  selectedDialogueId === id ? "primary selected" : ""
                } outlined`}
              >
                <Check
                  color={`${
                    selectedDialogueId === id
                      ? "var(--color-primary)"
                      : "var(--color-gray-500)"
                  }`}
                />
              </button>
              <Link
                className="content-row"
                to={`/scenario/${scenario.id}/dialogue/${id}`}
              >
                <div>
                  <h2>{dialogues[id].title}</h2>
                  <p>
                    <small>ID: {id}</small>
                  </p>
                </div>
                <button>
                  <ChevronRight size={33} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="content-centered align-center">
          <p>There are no Dialogues yet</p>
        </div>
      )}
      <div className="dialogue-actions">
        <div className="content-row">
          <button className="squircle-btn danger">
            <Minus />
          </button>
          <button
            onClick={() => {
              openModal(
                <CreateDialogueModal
                  isLoading={loading}
                  error={error}
                  onClose={closeModal}
                  onSubmit={closeModal}
                  scenario={scenario}
                />,
                "Create New Dialogue"
              );
            }}
            className="squircle-btn primary"
          >
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialoguesPanel;
