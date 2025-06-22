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
  FormLayout,
  ProgressIndicator,
  StartDialogueModal,
} from "../../components";
import EnhancedDialoguePlayer from "../../components/EnhancedDialoguePlayer/EnhancedDialoguePlayer";
import { useScenarioStore } from "../../store/useScenarioStore";
import type { AuthContextType } from "../../types";
import { useDialogueStore } from "../../store/useDialogueStore";
import { usePlayScenarioStore } from "../../store/usePlayScenarioStore";
import { useActorStore } from "../../store/useActorStore";

const EnhancedPlayScenarioPage = () => {
  const { dialogueId, scenarioId } = useParams<{
    dialogueId: string;
    scenarioId: string;
  }>();
  const [userFields, setUserFields] = useState<{ [key: string]: string }>();
  const navigate = useNavigate();
  const {
    loading: scenariosLoading,
    error: scenarioError,
    scenarios,
  } = useScenarioStore();
  const { setDialogue, scenario, dialogue } = usePlayScenarioStore();

  const {
    loading: dialoguesLoading,
    dialoguesByScenario,
    fetchDialoguesByScenario,
    error: dialogueError,
  } = useDialogueStore();
  const {
    error: actorError,
    selectedActor,
    actors,
    fetchActors,
    setActor,
  } = useActorStore();
  const [key, setKey] = useState<number>(0);
  const { openModal, closeModal } = useModal();
  const { profile: user } = useOutletContext<AuthContextType>();

  useEffect(() => {
    if (scenarioId) {
      fetchDialoguesByScenario(scenarioId);
      fetchActors();
    }
  }, [fetchActors, fetchDialoguesByScenario, scenarioId]);

  useEffect(() => {
    if (dialogue && dialogue.placeholders.length > 0) {
      // Open modal so we can enter the user fields
      openModal(
        <FormLayout<{ [key: string]: string }>
          onSubmit={(data) => setUserFields(data)}
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
        "Start Enhanced Dialogue"
      );
    }
    if (dialogueId && !selectedActor) {
      openModal(
        <FormLayout<{ actorId: string }>
          onSubmit={({ actorId }: { actorId: string }) => {
            setActor(actors[actorId]);
            closeModal();
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="form-group">
              <label>Select Your Actor</label>
              <select
                className="form-input"
                {...register("actorId", {
                  required: "Actor is required.",
                })}
              >
                {Object.values(actors).map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.first_name} {actor.last_name} - {actor.role}
                  </option>
                ))}
              </select>
              {errors.actorId && <p>{errors.actorId.message}</p>}
            </div>
          )}
        </FormLayout>,
        "Select Actor"
      );
    }
  }, [
    actors,
    closeModal,
    dialogue,
    dialogueId,
    navigate,
    openModal,
    selectedActor,
    setActor,
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
  if (selectedActor && (userFields || dialogue.placeholders.length === 0)) {
    return (
      <div key={key} className="play-scenario-container">
        <EnhancedDialoguePlayer
          userFields={userFields || {}}
          actor={selectedActor}
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

export default EnhancedPlayScenarioPage;