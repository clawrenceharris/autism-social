import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Actor, Dialogue, Scenario, UserProfile } from "../../types";
import { useEnhancedDialogue } from "../../hooks/useEnhancedDialogue";
import { useToast } from "../../context";
import { useVoiceStore } from "../../store/useVoiceStore";
import {
  AlertCircle,
  Eye,
  RotateCcw,
  Send,
  Settings,
  Volume2,
  VolumeXIcon,
  X,
} from "lucide-react";
import "../DialoguePlayer/DialoguePlayer.scss";

interface EnhancedDialoguePlayerProps {
  scenario: Scenario;
  dialogue: Dialogue;
  onReplay: () => void;
  user: UserProfile;
  onDialogueExit: () => void;
  actor: Actor;
  userFields: { [key: string]: string };
}

const EnhancedDialoguePlayer: React.FC<EnhancedDialoguePlayerProps> = ({
  scenario,
  user,
  userFields,
  dialogue,
  onDialogueExit,
  onReplay,
  actor,
}) => {
  const [customInput, setCustomInput] = useState("");
  const [isVolumeOn, setIsVolumeOn] = useState<boolean>(false);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const { fetchVoices, getAudioUrl } = useVoiceStore();
  const messageWindowRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const {
    isLoading,
    error,
    currentResponse,
    conversationHistory,
    currentPhase,
    startDialogue,
    submitUserInput,
    selectSuggestedResponse,
    endDialogue,
    retry,
  } = useEnhancedDialogue({
    scenario,
    dialogue,
    actor,
    user,
    onError: (error) => {
      showToast(error.message, { type: "error" });
    },
  });

  useEffect(() => {
    fetchVoices();
    startDialogue();
  }, [fetchVoices, startDialogue]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messageWindowRef.current?.scrollTo({
      top: messageWindowRef.current.scrollHeight,
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory.length]);

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
    async (text: string) => {
      if (!isVolumeOn || isGeneratingAudio) return;

      try {
        // Check cache first
        if (audioCache.has(text)) {
          const audioUrl = audioCache.get(text)!;
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
        setAudioCache((prev) => new Map(prev).set(text, audioUrl));

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
    // Play audio for the latest actor message
    const latestMessage = conversationHistory[conversationHistory.length - 1];
    if (latestMessage?.speaker === "actor" && isVolumeOn) {
      playAudio(latestMessage.content);
    }
  }, [conversationHistory, isVolumeOn, playAudio]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      audioCache.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [audioCache]);

  const handleOptionClick = async (responseId: string) => {
    selectSuggestedResponse(responseId);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    submitUserInput(customInput);
    setCustomInput("");
  };

  const isCompleted = currentPhase === "completed";

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
                  <button
                    onClick={onDialogueExit}
                    className="control-btn btn-danger"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div ref={messageWindowRef} className="chat-messages">
              {conversationHistory?.map((message) => (
                <div key={message.id} className={`message ${message.speaker}`}>
                  <p className="avatar">
                    {message.speaker === "actor"
                      ? actor?.first_name.charAt(0) || ""
                      : user.first_name.charAt(0) || ""}
                  </p>
                  <div className="message-content">
                    <div className="speaker-name">
                      {message.speaker === "actor"
                        ? actor?.first_name || "Unknown"
                        : "You"}
                    </div>
                    <div className="message-bubble">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
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
          </div>
        </div>
        {!isCompleted ? (
          <div className="response-section">
            <div className="response-options">
              {currentResponse?.suggestedUserResponses.map(
                (res, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(res.id)}
                    disabled={isLoading}
                    className={`response-option ${isLoading ? "disabled" : ""}`}
                  >
                    <p className="option-text">{res.content}</p>
                  </button>
                )
              )}
            </div>

            <div className="custom-response">
              <form onSubmit={handleCustomSubmit} className="input-container">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Or type your own response..."
                  disabled={isLoading}
                  className="form-input"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim() || isLoading}
                  className="send-btn"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        ) : null}
        {error && (
          <div className="error-state">
            <AlertCircle className="error-icon" />
            <h3 className="error-title">Dialogue Error</h3>
            <p className="error-message">{error.message}</p>
            <button onClick={retry} className="btn btn-danger">
              Try Again
            </button>
          </div>
        )}
        {isCompleted && (
          <div className="dialogue-actions">
            <button onClick={onDialogueExit} className="btn btn-primary">
              <Eye /> View Results
            </button>

            <button onClick={onDialogueExit} className="btn btn-tertiary">
              Go Back
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default EnhancedDialoguePlayer;