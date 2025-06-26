import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useModal } from "../../context";
import { X, Home } from "lucide-react";
import "../PlayScenarioPage/PlayScenarioPage.scss";
import {
  DialogueItem,
  DialoguePlayer,
  FormLayout,
  ProgressIndicator,
  StartDialogueModal,
} from "../../components";
import { useScenarioStore } from "../../store/useScenarioStore";
import type { AuthContextType } from "../../types";
import { useDialogueStore } from "../../store/useDialogueStore";
import { usePlayScenarioStore } from "../../store/usePlayScenarioStore";
import { useActorStore } from "../../store/useActorStore";

const PlayScenarioPage = () => {
  const [userFields, setUserFields] = useState<{ [key: string]: string }>();
  const navigate = useNavigate();
  const { loading: scenariosLoading, error: scenarioError } =
    useScenarioStore();
  const { setDialogue, scenario, dialogue } = usePlayScenarioStore();
  const { dialogueId } = useParams<{
    dialogueId: string;
    scenarioId: string;
  }>();
  const {
    loading: dialoguesLoading,
    dialoguesByScenario,
    error: dialogueError,
  } = useDialogueStore();
  const { error: actorError, actors, fetchActors } = useActorStore();
  const [key, setKey] = useState<number>(0);
  const { openModal, closeModal } = useModal();
  const { profile: user } = useOutletContext<AuthContextType>();

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  useEffect(() => {
    if (dialogueId && scenario && dialogue && !userFields) {
      // Open modal so we can enter the user fields
      openModal(
        <FormLayout<{ [key: string]: string }>
          onSubmit={(data) => {
            setUserFields(data);
            closeModal();
          }}
          onCancel={() => {
            closeModal();
            navigate(`/scenario/${scenario.id}`);
          }}
          descriptionStyle={{
            background: "#e3f3fe",
            padding: 30,
            borderRadius: 20,
            color: "#54cbe2",
          }}
          description={dialogue.description}
          submitText="Start Dialogue"
          showsCancelButton={true}
          cancelText="Cancel"
        >
          <StartDialogueModal
            dialogue={dialogue}
            placeholders={dialogue.placeholders}
          />
        </FormLayout>,
        "Start Dialogue"
      );
    }
  }, [
    closeModal,
    dialogueId,
    dialogue,
    navigate,
    openModal,
    scenario,
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

  if (scenarioError || dialogueError || actorError) {
    return (
      <div className="play-scenario-container">
        <div className="error-state">
          <h1>Oops! Something went wrong</h1>
          <p>{scenarioError || dialogueError || actorError}</p>
          <Link to={"/dashboard"} className="btn btn-primary">
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

          <Link to={"/dashboard"} className="btn btn-primary">
            <Home size={20} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!dialogueId) {
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
              <Link to={"/dashboard"} className="control-btn btn-danger">
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
              {dialoguesByScenario[scenario.id]?.map((dialogue) => (
                <DialogueItem key={dialogue.id} dialogue={dialogue} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render EnhancedDialoguePlayer when we have user fields (or confirmed no placeholders needed)
  if (dialogueId && dialogue && userFields) {
    return (
      <div key={key} className="play-scenario-container">
        <DialoguePlayer
          userFields={userFields || {}}
          actor={actors[dialogue.actor_id]}
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
