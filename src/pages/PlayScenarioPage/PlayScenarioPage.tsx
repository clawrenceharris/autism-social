import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useModal } from "../../context";
import { X, Home } from "lucide-react";
import "./PlayScenarioPage.scss";
import {
  DialogueItem,
  DialoguePlayer,
  FormLayout,
  ProgressIndicator,
} from "../../components";
import { useScenarioStore } from "../../store/useScenarioStore";
import type { AuthContextType } from "../../types";
import { useDialogueStore } from "../../store/useDialogueStore";
import { usePlayScenarioStore } from "../../store/usePlayScenarioStore";
import { useActorStore } from "../../store/useActorStore";

const PlayScenarioPage = () => {
  const { dialogueId } = useParams<{ dialogueId: string }>();
  const navigate = useNavigate();
  const {
    loading: scenariosLoading,

    error: scenarioError,

    fetchScenarios,

    scenarios,
  } = useScenarioStore();
  const { setDialogue, scenario, dialogue } = usePlayScenarioStore();

  const {
    loading: dialoguesLoading,
    dialoguesByScenario,
    fetchDialogues,
    dialogues,
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
    fetchDialogues();
    fetchScenarios();
    fetchActors();
  }, [fetchDialogues, fetchScenarios, fetchActors]);
  useEffect(() => {
    if (dialogueId) setDialogue(dialogues[dialogueId]);
    else setDialogue(null);
  }, [dialogueId, dialogues, setDialogue]);
  useEffect(() => {
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
              <label>Enter Your Actor</label>
              <select
                className="form-input"
                {...register("actorId", {
                  required: "Actor is required.",
                })}
              >
                {Object.values(actors).map((actor) => (
                  <option value={actor.id}>{actor.first_name}</option>
                ))}
              </select>
              {errors.actorId && <p>{errors.actorId.message}</p>}
            </div>
          )}
        </FormLayout>
      );
    }
  }, [actors, closeModal, dialogueId, openModal, selectedActor, setActor]);
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

  if (!dialogueId || !dialogue) {
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
  if (selectedActor && dialogue) {
    return (
      <div key={key} className="play-scenario-container">
        <DialoguePlayer
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

export default PlayScenarioPage;
