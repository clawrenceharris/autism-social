import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal, useScenario } from "../../context";
import { useDialogues } from "../../hooks/queries/useDialogues";
import { X, Home, Award } from "lucide-react";
import "./PlayScenarioPage.scss";
import {
  DialogueCompletedModal,
  DialoguePlayer,
  ProgressIndicator,
} from "../../components";
import type { DialogueContext } from "../../xstate/createDialogueMachine";
import type { ScoreCategory } from "../../types";
const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const { loading, error, scenario, dialogue } = useScenario();
  const { data: dialogues = [], isLoading: dialoguesLoading } = useDialogues();
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [context, setContext] = useState<DialogueContext | null>(null);

  const [key, setKey] = useState<number>(0);
  const getMultiplier = () => {
    let multiplier = 1;
    if (dialogue?.difficulty === "medium") {
      multiplier = 10;
    }
    if (dialogue?.difficulty === "hard") {
      multiplier = 20;
    }
    if (dialogue?.difficulty === "extra hard") {
      multiplier = 30;
    }
    return multiplier;
  };
  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  const handleExit = () => {
    navigate("/");
  };
  const getCategoryCount = (category: ScoreCategory) => {
    if (!dialogue) {
      return 0;
    }
    let count = 0;
    for (let i = 0; i < dialogue.steps.length; i++) {
      for (let j = 0; j < dialogue.steps[i].options.length; j++) {
        if (dialogue.steps[i].options[j].scores.includes(category)) {
          count++;
        }
      }
    }
    return count;
  };

  const calcScore = (
    context: DialogueContext,
    category: keyof DialogueContext & ScoreCategory
  ) => {
    if (context[category] === undefined && getCategoryCount(category) > 0) {
      return 0;
    } else if (!context[category]) {
      return undefined;
    }
    return context[category];
  };
  const getScores = (context: DialogueContext) => {
    const clarity = calcScore(context, "clarity");
    const empathy = calcScore(context, "empathy");
    const assertiveness = calcScore(context, "assertiveness");
    const socialAwareness = calcScore(context, "socialAwareness");

    const selfAdvocacy = calcScore(context, "selfAdvocacy");

    return {
      clarity: clarity ? clarity * getMultiplier() : undefined,
      empathy: empathy ? empathy * getMultiplier() : undefined,
      assertiveness: assertiveness
        ? assertiveness * getMultiplier()
        : undefined,
      socialAwareness: socialAwareness
        ? socialAwareness * getMultiplier()
        : undefined,
      selfAdvocacy: selfAdvocacy ? selfAdvocacy * getMultiplier() : undefined,
    };
  };

  // if(isComplete){
  //     const scores = getScores(context);

  //    return openModal(
  //     <DialogueCompletedModal
  //       onExitClick={handleExit}
  //       onReplayClick={handleReplay}
  //       scores={scores}
  //     />,
  //     <div className="results-header">
  //       <div className="results-icon">
  //         <Award size={20} />
  //       </div>
  //       <h2>Great Job!</h2>
  //     </div>
  //   );
  // }
  if (loading || dialoguesLoading) {
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
              {dialogues?.map((dialogue) => (
                <button
                  key={dialogue.id}
                  onClick={() =>
                    navigate(`/scenario/${scenario.id}/dialogue/${dialogue.id}`)
                  }
                  className="dialogue-option-card"
                >
                  <h3>{dialogue.title}</h3>
                  <p>Difficulty: {dialogue.difficulty}</p>
                  <div className="dialogue-tags">
                    {dialogue.persona_tags.map((tag, index) => (
                      <span key={index} className="tag">
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
