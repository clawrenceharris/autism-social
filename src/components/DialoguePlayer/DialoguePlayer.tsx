import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMachine } from "@xstate/react";
import type {
  Dialogue,
  DialogueOption,
  DialogueStep,
  Message,
  Scenario,
} from "../../types";

import "./DialoguePlayer.scss";
import { DialogueCompletedModal } from "../";
import { getDialogueScores } from "../../utils";
import { createDialogueMachine } from "../../xstate/createDialogueMachine";
import {
  RotateCcw,
  Send,
  Settings,
  Volume2,
  VolumeXIcon,
  X,
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { useToast } from "../../context";
import { useVoiceStore } from "../../store/useVoiceStore";

interface DialoguePlayerProps {
  scenario: Scenario;
  dialogue: Dialogue;
  onReplay: () => void;
  onExit: () => void;
  userFields: { [key: string]: string };
}
const DialoguePlayer = ({
  scenario,
  onExit,
  dialogue,
  userFields,
  onReplay,
}: DialoguePlayerProps) => {
  const machine = useMemo(
    () => createDialogueMachine(dialogue.id, dialogue.steps),
    [dialogue]
  );
  const [state, send] = useMachine(
    machine || createDialogueMachine("empty", [])
  );
  const { profile: user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isVolumeOn, setIsVolumeOn] = useState<boolean>(false);
  const { fetchVoices, getAudioUrl } = useVoiceStore();

  const messageWindowRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const getCurrentStep = (): DialogueStep | undefined => {
    return dialogue.steps.find((step) => step.id === state.value);
  };
  const currentStep = getCurrentStep();
  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messageWindowRef.current?.scrollTo({
      top: messageWindowRef.current.scrollHeight,
    });
  };
  const renderMessage = useCallback(
    (template: string): string => {
      return template.replace(/{{\s*(\w+)\.(\w+)\s*}}/g, (_, object, key) => {
        // For now, only userFields is supported, but you can expand this as needed
        if (object === "user") {
          return userFields[key] ?? "";
        }
        return "";
      });
    },
    [userFields]
  );
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = useCallback(
    async (text: string) => {
      showToast("Could not play audio. Please try again another time.");

      try {
        if (isVolumeOn) {
          const audioUrl = await getAudioUrl(dialogue.voice_id, {
            text,
          });

          const audio = new Audio(audioUrl);
          audio.play();
        }
      } catch (err) {
        console.log(err);
        showToast("Could not play audio. Please try again another time.");
      }
    },
    [dialogue.voice_id, getAudioUrl, isVolumeOn, showToast]
  );

  useEffect(() => {
    if (currentStep?.npc) {
      const message = renderMessage(currentStep.npc);
      playAudio(message);
    }
  }, [currentStep?.npc, playAudio, renderMessage]);

  // Initialize first message when dialogue is selected
  useEffect(() => {
    const firstStep = dialogue.steps[0];
    setMessages([
      {
        id: "initial",
        speaker: "npc",
        text: renderMessage(firstStep.npc),
      },
    ]);
  }, [dialogue, renderMessage]);

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) {
      // createVoice();
      hasRunRef.current = true;
    }
  }, []);

  const handleOptionClick = async (option: DialogueOption) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: "user",
      text: renderMessage(option.label),
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
          text: renderMessage(currentStep.npc),
        };

        setMessages((prev) => [...prev, npcMessage]);
      }

      setIsTyping(false);
    }, 500);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const userMessage: Message = {
      id: `custom-${Date.now()}`,
      speaker: "user",
      text: customInput,
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
      text: renderMessage(
        "That's an interesting response! Let me think about how to continue our conversation..."
      ),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

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
                  <button
                    onClick={() => setIsVolumeOn(!isVolumeOn)}
                    className="control-btn"
                  >
                    {isVolumeOn ? (
                      <Volume2 size={20} />
                    ) : (
                      <VolumeXIcon size={20} />
                    )}
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
                  <p className="avatar">
                    {message.speaker === "npc"
                      ? dialogue.actor?.name.charAt(0) || ""
                      : user?.name.charAt(0) || ""}
                  </p>
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

            {state.status !== "done" ? (
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
                          className={`response-option ${
                            isTyping ? "disabled" : ""
                          }`}
                        >
                          <p className="option-text">
                            {renderMessage(option.label)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="custom-response">
                  <form
                    onSubmit={handleCustomSubmit}
                    className="input-container"
                  >
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Or type your own response..."
                      disabled={isTyping}
                      className="form-input"
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
            ) : (
              <div className="response-section">
                <DialogueCompletedModal
                  onExitClick={onExit}
                  onReplayClick={onReplay}
                  scores={getDialogueScores(state.context)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DialoguePlayer;
