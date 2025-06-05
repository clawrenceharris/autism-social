import { useScenarioDialogues } from "../../hooks";
import "./DialoguesPanel.css";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import type { Scenario } from "../../types";
import { useModal } from "../../context";
import CreateDialogueModal from "../modals/CreateDialogueModal";
import { Link } from "react-router-dom";
import { useState } from "react";
interface DialoguesPanelProps {
  scenario: Scenario;
}
const DialoguesPanel = ({ scenario }: DialoguesPanelProps) => {
  const { scenarioDialogues, loading, error } = useScenarioDialogues(
    scenario.id
  );
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>(
    null
  );
  const { openModal } = useModal();
  const handleAddDialogue = () => {
    openModal(
      <CreateDialogueModal scenario={scenario} />,
      "Create New Dialogue"
    );
  };
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
      {scenarioDialogues.length > 0 ? (
        <div>
          {scenarioDialogues.map((item, idx) => (
            <div key={idx} className="dialogue-item ">
              <button
                onClick={() => handleSelectDialogue(item.id)}
                className={`squircle-btn ${
                  selectedDialogueId === item.id ? "primary selected" : ""
                } outlined`}
              >
                <Check
                  color={`${
                    selectedDialogueId === item.id
                      ? "var(--color-primary)"
                      : "var(--color-gray-500)"
                  }`}
                />
              </button>
              <Link
                className="content-row"
                to={`/scenario/${scenario.id}/dialogue/${item.id}`}
              >
                <div>
                  <h2>{item.title}</h2>
                  <p>
                    <small>ID: {item.id}</small>
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
          <button onClick={handleAddDialogue} className="squircle-btn primary">
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialoguesPanel;
