import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useModal } from "../../context";
import { X, Home } from "lucide-react";
import "./PlayScenarioPage.scss";
import {
  DialogueItem,
  DialogueOnboardingModal,
  DialoguePlayer,
  FormLayout,
  ProgressIndicator,
} from "../../components";
import { useScenarioStore } from "../../store/useScenarioStore";
import type { AuthContextType } from "../../types";

const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const {
    scenariosLoading,
    scenarioIds,
    dialoguesByScenario,
    error,
    dialoguesLoading,
    fetchDialoguesByScenario,
    fetchDialogues,
    fetchScenarios,
    selectedScenario: scenario,
    selectedDialogue: dialogue,
    scenarios,
    setScenario,
  } = useScenarioStore();
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [userFields, setUserFields] = useState<{
    [key: string]: string;
  } | null>(null);
  const [key, setKey] = useState<number>(0);
  const { openModal, closeModal } = useModal();
  const { profile: user } = useOutletContext<AuthContextType>();
  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };
  useEffect(() => {
    if (scenarioId) {
      fetchDialoguesByScenario(scenarioId);
      setScenario(scenarios[scenarioId]);
    }
  }, [fetchDialoguesByScenario, setScenario, scenarioId, scenarios]);
  useEffect(() => {
    fetchDialogues();
    fetchScenarios();
  }, [fetchDialogues, fetchScenarios]);
  const handleSubmit = useCallback(
    (data: { [key: string]: string }) => {
      setUserFields({ ...data, user_name: user.first_name });
      closeModal();
    },
    [closeModal, user.first_name]
  );

  const handleExit = () => {
    navigate("/");
  };
  console.log({ scenarioIds });

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
          <DialogueOnboardingModal
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
  }, [dialogue, userFields, openModal, closeModal, navigate, handleSubmit]);

  if (scenariosLoading || dialoguesLoading) {
    return (
      <div className="play-scenario-container ">
        <div className="center-absolute  ">
          <ProgressIndicator />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="play-scenario-container">
        <div className="game-content">
          <div className="error-state">
            <h1>Oops! Something went wrong</h1>
            <p>{error}</p>
            <button onClick={handleExit} className="btn btn-primary">
              <Home size={20} />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="play-scenario-container">
        <div className="game-content">
          <div className="error-state">
            <div>
              <h1>Scenario Not Found</h1>
              <p>The requested scenario could not be found.</p>
            </div>

            <button onClick={handleExit} className="btn btn-primary">
              <Home size={20} />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dialogue) {
    console.log({ dialoguesByScenario });
    console.log({ scenarioIds });

    return (
      <div className="play-scenario-container">
        <div className="game-header">
          <div className="header-content">
            <div className="scenario-info">
              <h1
                style={{ color: "white", fontSize: "1.7rem" }}
                className="scenario-title"
              >
                {scenario.title}
              </h1>
            </div>
            <div className="game-controls">
              <button onClick={handleExit} className="control-btn danger">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "block", margin: 20 }} className="game-content">
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
          user={user}
          userFields={userFields}
          onExit={handleExit}
          scenario={scenario}
          onReplay={handleReplay}
          dialogue={dialogue}
        />
      </div>
    );
  }

  // Show loading while waiting for user input
  return (
    <div className="play-scenario-container ">
      <div className="center-absolute  ">
        <ProgressIndicator />
      </div>
    </div>
  );
};

export default PlayScenarioPage;
