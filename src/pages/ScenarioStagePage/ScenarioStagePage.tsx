import { useState } from "react";
import { useLocation } from "react-router-dom";
import { DialoguePlayer, ProgressIndicator } from "../../components";
import { useScenario } from "../../context";
import useDialogues from "../../hooks/useDialogues";
import type { Dialogue as DialogueType } from "../../types";

const ScenarioStagePage = () => {
  const [key, setKey] = useState<number>(0);
  const location = useLocation();
  const { loading, error, scenario } = useScenario();
  const { dialogues } = useDialogues();
  const [dialogue, setDialogue] = useState<DialogueType>();
  console.log(dialogues);
  const handleReplay = () => {
    setKey((k) => k + 1); //this re-instantiates the machine
  };

  if (loading) {
    return (
      <div className="center-content">
        <ProgressIndicator />
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <h1>Uh oh, an error occured.</h1>
        <p>{error}</p>{" "}
      </div>
    );
  }
  if (!scenario) {
    return (
      <div>
        <h1>The requested Scenario could not be found</h1>
      </div>
    );
  }
  if (!dialogue) {
    return (
      <div>
        <h1>Select a Dialogue</h1>
        <div>
          {dialogues.map((item) => (
            <button
              onClick={() => setDialogue(item)}
              className="button primary"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="scenario-container">
      <DialoguePlayer
        from={location}
        key={key}
        onReplay={handleReplay}
        scenario={scenario}
        dialogue={dialogue}
      />
    </div>
  );
};

export default ScenarioStagePage;
