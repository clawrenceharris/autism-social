import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { scenarios } from "../../constants/scenarios";
import { Dialogue, ProgressIndicator } from "../../components";
import "./Scenario.css";
import { Dialogue as DialogueType } from "../../types";
import { assets } from "../../constants/assets";
import { useMachine } from "@xstate/react";
import { AnyStateMachine } from "xstate";
const Scenario = () => {
  const { id } = useParams<{ id: string }>();
  const [scenario, setScenario] = useState<DialogueType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);

  const handleReplay = () => {
    setKey((k) => k + 1); // This will re-instantiate the machine
  };
  useEffect(() => {
    if (!id) {
      return;
    }
    const scenario = scenarios.find((item) => item.id === Number(id));
    if (scenario) {
      setLoading(false);
      setScenario(scenario);
    } else {
      setLoading(false);
    }
  }, [scenario, id]);
  console.log(scenarios);
  if (loading) {
    return (
      <div className="content-centered">
        <ProgressIndicator />
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

  return (
    <div>
      <h1>{scenario.name}</h1>

      <Dialogue
        key={key}
        onComplete={() => setIsComplete(true)}
        onReplay={handleReplay}
        scenario={scenario}
      />
    </div>
  );
};

export default Scenario;
