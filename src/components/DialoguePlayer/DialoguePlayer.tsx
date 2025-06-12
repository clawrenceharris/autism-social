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
import { elevenlabs } from "../../lib/elevenlabs";
import { useToast } from "../../context";

interface DialoguePlayerProps {
  scenario: Scenario;
  dialogue: Dialogue;
  onReplay: () => void;
  onExit: () => void;
  userFields: { [key: string]: string };
}

interface AudioCache {
  [key: string]: string; // stepId -> audioUrl
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
  const [audioCache, setAudioCache] = useState<AudioCache>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);

  const messageWindowRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const tags = Array.from(state.tags) as unknown as DialogueStep[];
  const currentTag = tags?.[0];
  const [history, setHistory] = useState<{ speaker: string; text: string }[]>(
    []
  );

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messageWindowRef.current?.scrollTo({
      top: messageWindowRef.current.scrollHeight,
    });
  };

  const renderMessage = useCallback(
    (template: string): string => {
      return template.replace(/{{\s*user\.(\w+)\s*}}/g, (_, key) => {
        return userFields[key] ?? "";
      });
    },
    [userFields]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate character-specific voice settings based on actor and persona tags
  const getVoiceSettings = useCallback(() => {
    const actor = dialogue.actor;
    const personaTags = dialogue.persona_tags || [];
    
    // Default voice ID (you can customize this based on available voices)
    let voiceId = "OB0Jj6v9DGLLgz8dD57i"; // Default voice
    
    // You can map different persona tags to different voice IDs
    // This is a simplified example - you'd want to expand this based on available voices
    if (personaTags.includes("formal")) {
      voiceId = "OB0Jj6v9DGLLgz8dD57i"; // More formal voice
    } else if (personaTags.includes("friendly")) {
      voiceId = "OB0Jj6v9DGLLgz8dD57i"; // Friendly voice
    } else if (personaTags.includes("nervous")) {
      voiceId = "OB0Jj6v9DGLLgz8dD57i"; // Nervous voice
    }

    // Voice settings based on persona tags
    const voiceSettings = {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true,
    };

    // Adjust voice settings based on persona tags
    if (personaTags.includes("confident")) {
      voiceSettings.stability = 0.7;
      voiceSettings.style = 0.3;
    } else if (personaTags.includes("shy")) {
      voiceSettings.stability = 0.3;
      voiceSettings.style = 0.1;
    } else if (personaTags.includes("excited")) {
      voiceSettings.stability = 0.4;
      voiceSettings.style = 0.6;
    }

    return { voiceId, voiceSettings };
  }, [dialogue.actor, dialogue.persona_tags]);

  // Generate audio for a specific message
  const generateAudio = useCallback(async (text: string, stepId: string) => {
    if (!isVolumeOn || audioCache[stepId] || isGeneratingAudio) {
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const { voiceId, voiceSettings } = getVoiceSettings();
      
      const response = await elevenlabs.textToSpeech.convert(
        voiceId,
        {
          text: renderMessage(text),
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        },
        { apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY }
      );

      // Convert response to blob and create object URL
      const audioBlob = new Blob([response as BlobPart], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      setAudioCache(prev => ({
        ...prev,
        [stepId]: audioUrl
      }));

    } catch (err) {
      console.error(
        `Could not create dialogue voice: ${
          err instanceof Error
            ? err.message
            : String(err) || "An unknown error occurred."
        }`
      );
      showToast("Could not create dialogue voice.", { type: "error" });
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [isVolumeOn, audioCache, isGeneratingAudio, getVoiceSettings, renderMessage, showToast]);

  // Play audio for a specific step
  const playAudio = useCallback((stepId: string) => {
    if (!isVolumeOn || !audioCache[stepId]) {
      return;
    }

    try {
      const audio = new Audio(audioCache[stepId]);
      audio.play().catch(err => {
        console.error("Failed to play audio:", err);
      });
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  }, [isVolumeOn, audioCache]);

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
      
      // Generate audio for first message if volume is on
      if (isVolumeOn) {
        generateAudio(firstStep.npc, firstStep.id);
      }
    }
  }, [dialogue, renderMessage, isVolumeOn, generateAudio]);

  // Generate audio when volume is turned on and there are messages
  useEffect(() => {
    if (isVolumeOn && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.speaker === "npc") {
        const currentStep = dialogue.steps.find(step => 
          renderMessage(step.npc) === lastMessage.text
        );
        if (currentStep) {
          generateAudio(currentStep.npc, currentStep.id);
        }
      }
    }
  }, [isVolumeOn, messages, dialogue.steps, generateAudio, renderMessage]);

  // Play audio when new NPC message is added and audio is ready
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.speaker === "npc") {
        const currentStep = dialogue.steps.find(step => 
          renderMessage(step.npc) === lastMessage.text
        );
        if (currentStep && audioCache[currentStep.id]) {
          // Small delay to ensure message is rendered
          setTimeout(() => {
            playAudio(currentStep.id);
          }, 100);
        }
      }
    }
  }, [messages, dialogue.steps, audioCache, playAudio, renderMessage]);

  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioCache).forEach(url => {
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
        
        // Generate audio for the new NPC message if volume is on
        if (isVolumeOn) {
          generateAudio(currentStep.npc, currentStep.id);
        }
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

  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ speaker: "Alex", text: tags?.[0].npc }]);
    }
  }, [history.length, tags]);

  const previousStateRef = useRef(state.value);

  useEffect(() => {
    if (previousStateRef.current !== state.value) {
      setHistory((prev) => [
        ...prev,
        { speaker: "Alex", text: renderMessage(currentTag.npc) },
      ]);

      previousStateRef.current = state.value;
    }
  }, [state.value, currentTag.npc, renderMessage]);

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
                  <button
                    onClick={() => setIsVolumeOn(!isVolumeOn)}
                    className="control-btn"
                    title={isVolumeOn ? "Turn off audio" : "Turn on audio"}
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
                      : user?.name || ""}
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