import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import type {
  Dialogue,
  DialogueOption,
  DialogueStep,
  Message,
  Scenario,
} from "../../types";
import { DialogueCompletedModal, Modal } from "../";
import { getDialogueScores } from "../../utils";
import { createDialogueMachine } from "../../xstate/createDialogueMachine";
import { RotateCcw, Send, Settings, Volume2, X, Award } from "lucide-react";
interface DialoguePlayerProps {
  scenario: Scenario;
  dialogue: Dialogue;
  onReplay: () => void;
  onExit: () => void;
}
const DialoguePlayer = ({
  scenario,
  onExit,
  dialogue,
  onReplay,
}: DialoguePlayerProps) => {
  const machine = useMemo(
    () => createDialogueMachine(dialogue.id, dialogue.steps),
    [dialogue]
  );
  const [state, send] = useMachine(
    machine || createDialogueMachine("empty", [])
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messageWindowRef = useRef<HTMLDivElement>(null);

  // Create dialogue machine

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messageWindowRef.current?.scrollTo({
      top: messageWindowRef.current.scrollHeight,
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize first message when dialogue is selected
  useEffect(() => {
    if (dialogue && dialogue.steps.length > 0) {
      const firstStep = dialogue.steps[0];
      if (firstStep.npc) {
        setMessages([
          {
            id: "initial",
            speaker: "npc",
            text: firstStep.npc,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [dialogue]);

  const handleOptionClick = async (option: DialogueOption) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: "user",
      text: option.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );

    // Send event to state machine
    send({ type: option.event });

    // Get next step and add NPC response
    setTimeout(() => {
      const currentStep = dialogue?.steps.find(
        (step) => step.id === option.next
      );

      if (currentStep?.npc) {
        const npcMessage: Message = {
          id: `npc-${Date.now()}`,
          speaker: "npc",
          text: currentStep.npc,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, npcMessage]);
      }

      setIsTyping(false);
    }, 500);
  };

  const getCurrentStep = () => {
    if (!dialogue || !state.value) return null;
    return dialogue.steps.find((step) => step.id === state.value);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const userMessage: Message = {
      id: `custom-${Date.now()}`,
      speaker: "user",
      text: customInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCustomInput("");

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response (in a real app, this would call your AI service)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: `ai-${Date.now()}`,
      speaker: "npc",
      text: "That's an interesting response! Let me think about how to continue our conversation...",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const tags = Array.from(state.tags) as unknown as DialogueStep[];
  const currentTag = tags?.[0];
  const [history, setHistory] = useState<{ speaker: string; text: string }[]>(
    []
  );

  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ speaker: "Alex", text: tags?.[0].npc }]);
    }
  }, [history.length, tags]);

  const previousStateRef = useRef(state.value);

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

  const currentStep = getCurrentStep();
  return (
    <>
      <div className="game-content">
        <div className="dialogue-arena">
          <div className="chat-window">
            <div className="game-header">
              <div className="header-content">
                <div className="scenario-info">
                  <h1 className="scenario-title">{scenario.title}</h1>
                  <div className="scenario-badge">{dialogue.title}</div>
                </div>
                <div className="game-controls">
                  <button className="control-btn">
                    <Volume2 size={20} />
                  </button>
                  <button className="control-btn">
                    <Settings size={20} />
                  </button>
                  <button onClick={onReplay} className="control-btn">
                    <RotateCcw size={20} />
                  </button>
                  <button onClick={onExit} className="control-btn danger">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div ref={messageWindowRef} className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.speaker}`}>
                  <div className="avatar">
                    {message.speaker === "npc" ? "A" : "Y"}
                  </div>
                  <div className="message-content">
                    <div className="speaker-name">
                      {message.speaker === "npc" ? "Alex" : "You"}
                    </div>
                    <div className="message-bubble">{message.text}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator">
                  <div className="avatar">A</div>
                  <div className="typing-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              )}

              <div ref={messageWindowRef} />
            </div>

            <div className="response-section">
              {currentStep?.options && currentStep.options.length > 0 && (
                <>
                  <div className="response-prompt"></div>

                  <div className="response-options">
                    {currentStep.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        disabled={isTyping}
                        className="response-option"
                      >
                        <p className="option-text">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="custom-response">
                <form
                  onSubmit={handleCustomSubmit}
                  className="custom-input-container"
                >
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Or type your own response..."
                    disabled={isTyping}
                    className="custom-input"
                  />
                  <button
                    type="submit"
                    disabled={!customInput.trim() || isTyping}
                    className="send-btn"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          <Modal
            showsCloseButton={false}
            title={
              <div className="results-header">
                <div className="results-icon">
                  <Award size={20} />
                </div>
                <h2>Dialogue Complete!</h2>
              </div>
            }
            isOpen={state.status === "done"}
          >
            <DialogueCompletedModal
              onExitClick={onExit}
              onReplayClick={onReplay}
              scores={getDialogueScores(state.context)}
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

export default DialoguePlayer;
