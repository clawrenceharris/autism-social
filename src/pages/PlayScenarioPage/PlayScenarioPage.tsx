import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useModal } from "../../context";
import { X, Home } from "lucide-react";
import "./PlayScenarioPage.scss";
import {
  DialogueItem,
  StartDialogueModal,
  DialoguePlayer,
  FormLayout,
  ProgressIndicator,
} from "../../components";
import { useScenarioStore } from "../../store/useScenarioStore";
import type { AuthContextType } from "../../types";
import { useDialogueStore } from "../../store/useDialogueStore";
import { usePlayScenarioStore } from "../../store/usePlayScenarioStore";

const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const {
    loading: scenariosLoading,

    error: scenarioError,

    fetchScenarios,

    scenarios,
  } = useScenarioStore();
  const { setDialogue, setUserFields, userFields, scenario, dialogue } =
    usePlayScenarioStore();

  const {
    loading: dialoguesLoading,
    dialoguesByScenario,
    fetchDialogues,
    error: dialogueError,
  } = useDialogueStore();

  const [key, setKey] = useState<number>(0);
  const { openModal, closeModal } = useModal();
  const { profile: user } = useOutletContext<AuthContextType>();

  useEffect(() => {
    fetchDialogues();
    fetchScenarios();
  }, [fetchDialogues, fetchScenarios]);
  const handleSubmit = useCallback(
    (data: { [key: string]: string }) => {
      setUserFields({ ...data, user_name: user.first_name });
      closeModal();
    },
    [closeModal, setUserFields, user.first_name]
  );

  useEffect(() => {
    // If we selected a dialogue and there are placeholders but no user fields defined
    if (
      dialogue &&
      dialogue.placeholders &&
      dialogue.placeholders.length > 0 &&
      !userFields
    ) {
      // Open modal so we can enter the user fields
      openModal(
        <FormLayout<{ [key: string]: string }>
          onSubmit={handleSubmit}
          submitText="Start Dialogue"
          showsCancelButton={true}
          cancelText="Cancel"
          onCancel={() => {
            closeModal();
            navigate("/");
          }}
        >
          <StartDialogueModal
            dialogue={dialogue}
            placeholders={dialogue.placeholders}
          />
        </FormLayout>,
        "Start Dialogue"
      );
    } else if (
      dialogue &&
      (!dialogue.placeholders || dialogue.placeholders.length === 0) &&
      !userFields
    ) {
      // If no placeholders are needed, set empty user fields
      setUserFields({});
    }
  }, [
    closeModal,
    dialogue,
    handleSubmit,
    navigate,
    openModal,
    setUserFields,
    userFields,
  ]);

  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  const handleExit = () => {
    if (scenario) navigate(`/scenario/${scenario.id}`);
    setDialogue(null);
  };
  if (scenariosLoading || dialoguesLoading) {
    return (
      <div className="play-scenario-container loading-state">
        <ProgressIndicator />
      </div>
    );
  }

  if (scenarioError || dialogueError) {
    return (
      <div className="play-scenario-container">
        <div className="error-state">
          <h1>Oops! Something went wrong</h1>
          <p>{scenarioError || dialogueError}</p>
          <Link to={"/"} className="btn btn-primary">
            <Home size={20} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="play-scenario-container">
        <div className="error-state">
          <div>
            <h1>Scenario Not Found</h1>
            <p>The requested scenario could not be found.</p>
          </div>

          <Link to={"/"} className="btn btn-primary">
            <Home size={20} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!dialogue) {
    return (
      <div className="play-scenario-container">
        <div className="game-header">
          <div className="header-content">
            <div className="scenario-info ">
              <h1
                style={{ color: "white", fontSize: "1.7rem" }}
                className="scenario-title"
              >
                {scenario.title}
              </h1>
            </div>
            <div className="game-controls">
              <Link to={"/"} className="control-btn btn-danger">
                <X size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="dialogue-selection">
            <div className="selection-header">
              <h2>Choose Your Dialogue</h2>
              <p>Select a dialogue to begin your social interaction practice</p>
            </div>

            <div className="dialogue-options">
              {Object.keys(scenarios).map((id) => {
                if (dialoguesByScenario[id])
                  return dialoguesByScenario[id]?.map((dialogue) => (
                    <DialogueItem key={dialogue.id} dialogue={dialogue} />
                  ));
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render DialoguePlayer when we have user fields (or confirmed no placeholders needed)
  if (userFields !== null) {
    return (
      <div key={key} className="play-scenario-container">
        <DialoguePlayer
          onDialogueExit={handleExit}
          user={user}
          scenario={scenario}
          onReplay={handleReplay}
          dialogue={dialogue}
        />
      </div>
    );
  }

  // Show loading while waiting for user input
  return (
    <div className="play-scenario-container loading-state">
      <ProgressIndicator />
    </div>
  );
};

export default PlayScenarioPage;
