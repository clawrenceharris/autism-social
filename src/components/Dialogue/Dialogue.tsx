import React, { useEffect, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import { Dialogue as DialogueType } from "../../types";
import { assets } from "../../constants/assets";
import "./Dialogue.css";
const Dialogue = ({
  scenario,
  onComplete,
  onReplay,
}: {
  scenario: DialogueType;
  onReplay: () => void;
  onComplete: () => void;
}) => {
  const [state, send] = useMachine(scenario.machine);
  const tags = Array.from(state.tags) as any[];
  const currentTag = tags?.[0];
  const [history, setHistory] = useState<{ speaker: string; text: string }[]>(
    []
  );
  useEffect(() => {
    if (history.length === 0) {
      setHistory((prev) => [
        { speaker: scenario.actor.name, text: tags?.[0].npc },
      ]);
    }
  }, []);
  useEffect(() => {
    if (state.status === "done") {
      onComplete();
    }
  }, [state.status]);
  const handleOptionClick = (opt: any) => {
    setHistory((prev) => [...prev, { speaker: "user", text: opt?.label }]);
    send({ type: opt.event });
  };
  const previousStateRef = useRef(state.value);

  // 🧠 Append to history only when state.value changes
  useEffect(() => {
    if (previousStateRef.current !== state.value) {
      // Add NPC response
      if (currentTag?.npc) {
        setHistory((prev) => [
          ...prev,
          { speaker: "npc", text: currentTag?.npc },
        ]);
      }
      previousStateRef.current = state.value;
    }
  }, [state.value, currentTag?.npc]);

  const parseLabel = (label: string) => {
    const parsed = label.replace("<name>", "Jonny");
    return parsed;
  };
  console.log(history);
  return (
    <div>
      <div className="chat-box">
        <div>
          {history.map((item, index) => (
            <h3>
              <strong>
                {item?.speaker}
                {": "}
              </strong>
              {item?.text}
            </h3>
          ))}
        </div>
      </div>
      {state.status !== "done" ? (
        <div>
          <ul className="content-body">
            {currentTag?.options?.map((opt: any, idx: number) => (
              <li
                className="option"
                key={idx}
                style={{ marginBottom: "0.5rem" }}
              >
                <button
                  className="option"
                  onClick={() => handleOptionClick(opt)}
                  style={{}}
                >
                  {parseLabel(opt.label)}
                </button>
              </li>
            ))}
          </ul>
          <div className="margin-y content-row">
            <button className="circle-button danger" onClick={onReplay}>
              <img
                className="icon"
                src={assets.close}
                aria-label="Replay Scenario"
                alt="Restart"
              />
            </button>
            <button className="primary circle-button" onClick={onReplay}>
              <img
                className="icon"
                src={assets.restart}
                aria-label="Replay Scenario"
                alt="Restart"
              />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div>
            <h2>🎯 Your Results</h2>
            <p>Clarity: {state.context.clarity}</p>
            <p>Empathy: {state.context.empathy}</p>
            <p>Assertiveness: {state.context.assertiveness}</p>
            <button
              onClick={onReplay}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Replay Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dialogue;
