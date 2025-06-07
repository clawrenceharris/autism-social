import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import "./DialoguePlayer.css";
import type {
  Dialogue,
  DialogueOption,
  DialogueStep,
  Scenario,
} from "../../types";
import { createDialogueMachine } from "../../xstate/createDialogueMachine";
import { useNavigate, type Location } from "react-router-dom";
import { ArrowUpNarrowWide, Redo, X } from "lucide-react";

const DialoguePlayer = ({
  from,
  scenario,
  dialogue,
  onReplay,
}: {
  from: Location;
  scenario: Scenario;
  dialogue: Dialogue;
  onReplay: () => void;
}) => {
  const machine = useMemo(
    () => createDialogueMachine(dialogue.id, dialogue.steps),
    [dialogue]
  );
  const [state, send] = useMachine(machine);

  const tags = Array.from(state.tags) as unknown as DialogueStep[];
  const currentTag = tags?.[0];
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [input, setInput] = useState<string>();
  const [history, setHistory] = useState<{ speaker: string; text: string }[]>(
    []
  );
  const [isBusy, setIsBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ speaker: "Alex", text: tags?.[0].npc }]);
    }
  }, [history.length, tags]);
  useEffect(() => {
    if (state.status === "done") {
      setIsComplete(true);
    }
  }, [state.status]);

  const handleOptionClick = (opt: DialogueOption) => {
    setIsBusy(true);
    setHistory((prev) => [...prev, { speaker: "You", text: opt.label }]);
    setTimeout(() => {
      setIsBusy(false);
      send({ type: opt.event });
    }, 2000);
  };
  const previousStateRef = useRef(state.value);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInput("");
    if (input) setHistory((prev) => [...prev, { speaker: "You", text: input }]);
  };
  useEffect(() => {
    if (previousStateRef.current !== state.value) {
      if (currentTag?.npc) {
        setHistory((prev) => [
          ...prev,
          { speaker: "Alex", text: currentTag?.npc },
        ]);
      }
      previousStateRef.current = state.value;
    }
  }, [state.value, currentTag?.npc]);

  const parseLabel = (label: string) => {
    const parsed = label.replace("<name>", "Jonny");
    return parsed;
  };

  return (
    <div className="dialogue-container">
      <div className="controls margin-y content-row justify-between">
        <button
          className="button circle-button danger"
          onClick={() => setIsComplete(true)}
        >
          <X />
        </button>

        <button className="button primary content-row" onClick={onReplay}>
          <Redo />
          Replay
        </button>
      </div>

      <div className="chat-container">
        <div className="chat-content scroll-content flex-column">
          <h1>{scenario.title}</h1>

          {history.map((item, index) => (
            <p key={index}>
              <strong>
                {item?.speaker}
                {": "}
              </strong>
              {item?.text}
            </p>
          ))}
        </div>
        <div className="response-container">
          <form onSubmit={handleSubmit} className="content-row">
            <input
              disabled={isBusy}
              onChange={(e) => setInput(e.target.value)}
              className="input"
              value={input}
              type="text"
              placeholder="Enter your response"
            />
            <button type="submit" className="button primary circle-button">
              <ArrowUpNarrowWide />
            </button>
          </form>

          <ul className="margin-y scroll-content">
            {currentTag?.options?.map((opt, idx: number) => (
              <li
                className="option"
                key={idx}
                style={{ marginBottom: "0.5rem" }}
              >
                <button
                  disabled={isBusy}
                  type="button"
                  className="option"
                  onClick={() => handleOptionClick(opt)}
                  style={{}}
                >
                  {parseLabel(opt.label)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={`content-centered-absolute results-container ${
          isComplete ? "visible" : ""
        }`}
      >
        <div className="flex-column">
          <h2>Your Results</h2>
          <div>
            <p>Clarity: {state.context.clarity}</p>
            <p>Empathy: {state.context.empathy}</p>
            <p>Assertiveness: {state.context.assertiveness}</p>
          </div>

          <div className="flex-content">
            <button
              className="content-centered button primary content-row"
              onClick={onReplay}
            >
              <Redo />
              Replay
            </button>
            <button
              className="button  secondary"
              onClick={() => navigate(from)}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialoguePlayer;
