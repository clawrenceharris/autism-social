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
import { useDialogueStore } from "../../store/useDialogueStore";
import { usePlayScenarioStore } from "../../store/usePlayScenarioStore";
import { useActorStore } from "../../store/useActorStore";
import type { AuthContextType } from "../../components/routes";

const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const { loading: scenariosLoading, error: scenarioError } =
    useScenarioStore();
  const { setDialogue, scenario, setUserFields, userFields } =
    usePlayScenarioStore();
  const { dialogueId, scenarioId } = useParams<{
    dialogueId: string;
    scenarioId: string;
  }>();
  const {
    loading: dialoguesLoading,
    dialoguesByScenario,
    error: dialogueError,
    dialogues,
  } = useDialogueStore();
  const { error: actorError, actors, fetchActors } = useActorStore();
  const [key, setKey] = useState<number>(0);
  const { openModal, closeModal } = useModal();
  const { profile: user } = useOutletContext<AuthContextType>();

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  useEffect(() => {
    if (dialogueId && scenarioId && !userFields) {
      // Open modal so we can enter the user fields
      openModal(
        <FormLayout<{ [key: string]: string }>
          onSubmit={(data) => {
            setUserFields(data);
            closeModal();
          }}
          onCancel={() => {
            closeModal();
            navigate(`/scenario/${scenarioId}`);
          }}
          descriptionStyle={{
            background: "#e3f3fe",
            padding: 30,
            borderRadius: 20,
            color: "#54cbe2",
          }}
          description={dialogues[dialogueId].description}
          submitText="Start Dialogue"
          showsCancelButton={true}
          cancelText="Cancel"
        >
          <StartDialogueModal
            dialogue={dialogues[dialogueId]}
            placeholders={dialogues[dialogueId].placeholders}
          />
        </FormLayout>,
        "Start Dialogue"
      );
    }
  }, [
    closeModal,
    dialogueId,
    dialogues,
    navigate,
    openModal,
    scenario,
    scenarioId,
    setUserFields,
    userFields,
  ]);

  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  const handleExit = () => {
    if (scenario) navigate(`/scenario/${scenario.id}`);
    setDialogue(null);
    setUserFields(null);
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
              <Link to={"/dashboard"} className="control-btn">
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

            <div className="dialogue-list">
              {dialoguesByScenario[scenario.id]?.map((dialogue) => (
                <DialogueItem key={dialogue.id} dialogue={dialogue} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render DialoguePlayer when we have user fields and dialogue id
  if (dialogueId && userFields) {
    return (
      <div key={key} className="play-scenario-container">
        <DialoguePlayer
          userFields={userFields || {}}
          actor={actors[dialogues[dialogueId].actor_id]}
          onDialogueExit={handleExit}
          user={user}
          scenario={scenario}
          onReplay={handleReplay}
          dialogue={dialogues[dialogueId]}
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
