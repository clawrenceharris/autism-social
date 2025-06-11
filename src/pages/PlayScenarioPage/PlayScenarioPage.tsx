import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScenario } from "../../context";
import { X, Home } from "lucide-react";
import "./PlayScenarioPage.scss";
import { DialoguePlayer, ProgressIndicator } from "../../components";
import { useScenarioStore } from "../../store/useScenarioStrore";

const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const { scenariosLoading, error, dialogueIds, dialogues, dialoguesLoading } =
    useScenarioStore();

  const [key, setKey] = useState<number>(0);
  const { scenario, dialogue } = useScenario();
  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  const handleExit = () => {
    navigate("/");
  };

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
            <h1>Scenario Not Found</h1>
            <p>The requested scenario could not be found.</p>
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
              <h1 className="scenario-title">{scenario.title}</h1>
              <div className="scenario-badge">Select Dialogue</div>
            </div>
            <div className="game-controls">
              <button onClick={handleExit} className="control-btn danger">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="game-content">
          <div className="dialogue-selection">
            <div className="selection-header">
              <h2>Choose Your Dialogue</h2>
              <p>Select a dialogue to begin your social interaction practice</p>
            </div>

            <div className="dialogue-options">
              {dialogueIds.map((id) => (
                <button
                  key={id}
                  onClick={() =>
                    navigate(`/scenario/${scenario.id}/dialogue/${id}`)
                  }
                  className="dialogue-option-card"
                >
                  <h3>{dialogues[id].title}</h3>
                  <p>Difficulty: {dialogues[id].difficulty}</p>
                  <div className="dialogue-tags">
                    {dialogues[id].persona_tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={key} className="play-scenario-container">
      <DialoguePlayer
        onExit={handleExit}
        scenario={scenario}
        onReplay={handleReplay}
        dialogue={dialogue}
      />
    </div>
  );
};

export default PlayScenarioPage;
