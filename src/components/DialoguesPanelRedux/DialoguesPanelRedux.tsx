import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchScenarioDialogues,
  selectDialoguesByScenario,
  selectDialoguesLoading,
  selectDialoguesError,
  clearError,
  addDialogueToScenario,
} from "../../store/slices/dialoguesSlice";
import { addToast } from "../../store/slices/uiSlice";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import type { Dialogue, Scenario } from "../../types";
import { useModal } from "../../context";
import { CreateDialogueModal } from "../";
import { Link } from "react-router-dom";

interface DialoguesPanelReduxProps {
  scenario: Scenario;
}

const DialoguesPanelRedux = ({ scenario }: DialoguesPanelReduxProps) => {
  const dispatch = useAppDispatch();
  const dialogues = useAppSelector((state) =>
    selectDialoguesByScenario(state, scenario.id)
  );
  const loading = useAppSelector(selectDialoguesLoading);
  const error = useAppSelector(selectDialoguesError);
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>(
    null
  );
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    dispatch(fetchScenarioDialogues(scenario.id));
  }, [dispatch, scenario.id]);

  useEffect(() => {
    if (error) {
      dispatch(addToast({ message: error, type: "error" }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSelectDialogue = (id: string) => {
    if (selectedDialogueId === id) {
      return setSelectedDialogueId(null);
    }
    setSelectedDialogueId(id);
  };

  const handleDialogueCreated = (dialogue: Dialogue) => {
    dispatch(addDialogueToScenario({ scenarioId: scenario.id, dialogue }));
    dispatch(
      addToast({
        message: "Dialogue created successfully!",
        type: "success",
      })
    );
    closeModal();
  };

  if (loading) {
    return (
      <div className="content-centered">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="outlined flex-column dialogues-container">
      {dialogues.length > 0 ? (
        <div>
          {dialogues.map((item, idx) => (
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
          <button
            onClick={() => {
              openModal(
                <CreateDialogueModal
                  isLoading={loading}
                  error={error}
                  onClose={closeModal}
                  onSubmit={handleDialogueCreated}
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

export default DialoguesPanelRedux;
