import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal, useScenario } from "../../context";
import { X, Home } from "lucide-react";
import "./PlayScenarioPage.scss";
import {
  DialogueItem,
  DialogueOnboardingModal,
  DialoguePlayer,
  FormLayout,
  ProgressIndicator,
} from "../../components";
import { useScenarioStore } from "../../store/useScenarioStrore";

const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const {
    scenariosLoading,
    scenarioIds,
    dialoguesByScenario,
    error,
    dialoguesLoading,

    fetchDialoguesByScenario: fetchScenarioDialogues,
  } = useScenarioStore();
  const [userFields, setUserFields] = useState({});
  const [key, setKey] = useState<number>(0);
  const { scenario, dialogue } = useScenario();
  const { openModal } = useModal();
  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };
  const handleSubmit = (data: { [key: string]: string }) => {
    setUserFields(data);
  };
  const handleExit = () => {
    navigate("/");
  };
  useEffect(() => {
    if (scenario) fetchScenarioDialogues(scenario.id);
  }, [fetchScenarioDialogues, scenario]);

  useEffect(() => {
    //if we selected a dialogue and there are no user fields defined
    if (!userFields && dialogue) {
      //open modal so we can enter the user fields
      openModal(
        <FormLayout<{ [key: string]: string }> onSubmit={handleSubmit}>
          <DialogueOnboardingModal />
        </FormLayout>,
        "Set Dialogue Inputs"
      );
    }
  });

  if (scenariosLoading || dialoguesLoading) {
    return (
      <div className="play-scenario-container">
        <div className="game-content">
          <div className="center-absolute">
            <ProgressIndicator />
          </div>
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
              {scenarioIds.map((id) => {
                return dialoguesByScenario[id]?.map((dialogue) => (
                  <DialogueItem dialogue={dialogue} />
                ));
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (userFields) {
    return (
      <div key={key} className="play-scenario-container">
        <DialoguePlayer
          userFields={userFields}
          onExit={handleExit}
          scenario={scenario}
          onReplay={handleReplay}
          dialogue={dialogue}
        />
      </div>
    );
  }
};

export default PlayScenarioPage;
