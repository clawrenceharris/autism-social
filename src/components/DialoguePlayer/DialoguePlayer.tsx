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
  UserProfile,
} from "../../types";

import "./DialoguePlayer.scss";
import { DialogueCompletedModal, ProgressIndicator } from "../";
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
import { useToast } from "../../context";
import { useVoiceStore } from "../../store/useVoiceStore";
import { useActorStore } from "../../store/useActorStore";

interface DialoguePlayerProps {
  scenario: Scenario;
  dialogue: Dialogue;
  onReplay: () => void;
  onExit: () => void;
  user: UserProfile;
  userFields: { [key: string]: string };
}

const DialoguePlayer = ({
  scenario,
  onExit,
  user,
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isVolumeOn, setIsVolumeOn] = useState<boolean>(false);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const { fetchVoices, getAudioUrl } = useVoiceStore();
  const {
    selectedActor: actor,
    setActor,
    fetchActors,
    actors,
    loading,
  } = useActorStore();
  const messageWindowRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const getCurrentStep = (): DialogueStep | undefined => {
    return dialogue.steps.find((step) => step.id === state.value);
  };
  const currentStep = getCurrentStep();

  useEffect(() => {
    fetchVoices();
    fetchActors();
  }, [fetchActors, fetchVoices, setActor]);
  useEffect(() => {
    setActor(dialogue.actor_id);
  }, [dialogue.actor_id, setActor, actors]);
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messageWindowRef.current?.scrollTo({
      top: messageWindowRef.current.scrollHeight,
    });
  };

  const renderMessage = useCallback(
    (template: string): string => {
      return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
        return userFields[key]?.toString() ?? "";
      });
    },
    [userFields]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getVoiceSettings = useCallback(() => {
    const personaTags = dialogue.persona_tags || [];

    // Base voice settings
    const settings = {
      stability: 0.5,
      style: 0.5,
      use_speaker_boost: true,
    };

    // Adjust based on persona tags
    if (personaTags.includes("confident")) {
      settings.stability = 0.7;
      settings.style = 0.8;
    } else if (personaTags.includes("shy")) {
      settings.stability = 0.3;
      settings.style = 0.2;
    } else if (personaTags.includes("excited")) {
      settings.stability = 0.4;
      settings.style = 0.9;
    } else if (personaTags.includes("nervous")) {
      settings.stability = 0.2;
      settings.style = 0.3;
    }

    return settings;
  }, [dialogue.persona_tags]);

  const playAudio = useCallback(
    async (text: string, stepId: string) => {
      if (!isVolumeOn || isGeneratingAudio) return;

      try {
        // Check cache first
        if (audioCache.has(stepId)) {
          const audioUrl = audioCache.get(stepId)!;
          const audio = new Audio(audioUrl);
          await audio.play();
          return;
        }

        setIsGeneratingAudio(true);

        const voiceSettings = getVoiceSettings();
        const audioUrl = await getAudioUrl(actor?.voice_id || "default", {
          text,
          voice_settings: voiceSettings,
        });

        // Cache the audio URL
        setAudioCache((prev) => new Map(prev).set(stepId, audioUrl));

        const audio = new Audio(audioUrl);
        await audio.play();
      } catch (err) {
        console.log("Audio playback error:", err);
        showToast("Could not play audio. Please try again another time.", {
          type: "warning",
        });
      } finally {
        setIsGeneratingAudio(false);
      }
    },
    [
      isVolumeOn,
      isGeneratingAudio,
      audioCache,
      getVoiceSettings,
      getAudioUrl,
      actor?.voice_id,
      showToast,
    ]
  );

  useEffect(() => {
    if (currentStep?.npc && isVolumeOn) {
      const message = renderMessage(currentStep.npc);
      playAudio(message, currentStep.id);
    }
  }, [currentStep?.npc, currentStep?.id, playAudio, renderMessage, isVolumeOn]);

  // Initialize first message when dialogue is selected
  useEffect(() => {
    const firstStep = dialogue.steps[0];
    if (firstStep) {
      setMessages([
        {
          id: "initial",
          speaker: "npc",
          text: renderMessage(firstStep.npc),
        },
      ]);
    }
  }, [dialogue, renderMessage]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      audioCache.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [audioCache]);

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
  if (loading) {
    return (
      <div>
        <ProgressIndicator />
      </div>
    );
  }

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
                    disabled={isGeneratingAudio}
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
                      ? actor?.first_name.charAt(0) || ""
                      : user.first_name.charAt(0) || ""}
                  </p>
                  <div className="message-content">
                    <div className="speaker-name">
                      {message.speaker === "npc"
                        ? actor?.first_name || "Unknown"
                        : user.first_name}
                    </div>
                    <div className="message-bubble">{message.text}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator">
                  <div className="avatar">
                    {actor?.first_name.charAt(0) || ""}
                  </div>
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
