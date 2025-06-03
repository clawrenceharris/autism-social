import { useScenarioDialogues } from "../../hooks";
import "./DialoguesPanel.css";
import { ChevronRight, ChevronRightIcon, Minus, Plus } from "lucide-react";
import type { Dialogue, Scenario } from "../../types";
import { useModal } from "../../context";
import CreateDialogueModal from "../modals/CreateDialogueModal";
import { Link } from "react-router-dom";
interface DialoguesPanelProps {
  scenario: Scenario;
  onDialogueClick: (dialogue: Dialogue) => void;
}
const DialoguesPanel = ({ scenario, onDialogueClick }: DialoguesPanelProps) => {
  const { scenarioDialogues, loading, error } = useScenarioDialogues(
    scenario.id
  );
  const { openModal } = useModal();
  const handleAddClick = () => {
    openModal(
      <CreateDialogueModal scenario={scenario} />,
      "Create New Dialogue"
    );
  };
  if (loading) {
    return (
      <div className="content-centered-absolute">
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="content-centered-absolute">
        <h1>An Error occurred</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="outlined flex-column justify-between dialogues-container">
      {scenarioDialogues.length > 0 ? (
        <div>
          {scenarioDialogues.map((item) => (
            <Link
              to={`/scenario/${scenario.id}/dialogue/${item.id}`}
              className="dialogue-item"
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
          ))}
        </div>
      ) : (
        <div className="content-centered align-center">
          <p>There are no Dialogues yet</p>
        </div>
      )}
      <div className="dialogue-actions">
        <div className="content-row">
          <button className="squircle-btn danger outlined">
            <Minus />
          </button>
          <button
            onClick={handleAddClick}
            className="squircle-btn primary outlined"
          >
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialoguesPanel;
