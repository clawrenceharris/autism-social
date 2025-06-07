import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { useScenario } from "../../context";
import { useDialogues } from "../../hooks/queries/useDialogues";
import { createDialogueMachine } from "../../xstate/createDialogueMachine";
import type { Dialogue as DialogueType, DialogueOption } from "../../types";
import {
  X,
  RotateCcw,
  Send,
  Award,
  Volume2,
  Settings,
  Home,
} from "lucide-react";
import "./PlayScenarioPage.scss";

interface Message {
  id: string;
  speaker: "npc" | "user";
  text: string;
  timestamp: Date;
}

const PlayScenarioPage = () => {
  const navigate = useNavigate();
  const { loading, error, scenario } = useScenario();
  const { data: dialogues = [], isLoading: dialoguesLoading } = useDialogues();

  const [selectedDialogue, setSelectedDialogue] = useState<DialogueType | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [machineKey, setMachineKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create dialogue machine
  const machine = selectedDialogue
    ? createDialogueMachine(selectedDialogue.id, selectedDialogue.steps)
    : null;

  const [state, send] = useMachine(
    machine || createDialogueMachine("empty", [])
  );

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize first message when dialogue is selected
  useEffect(() => {
    if (selectedDialogue && selectedDialogue.steps.length > 0) {
      const firstStep = selectedDialogue.steps[0];
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
  }, [selectedDialogue, machineKey]);

  // Handle state changes
  useEffect(() => {
    if (state.status === "done") {
      setShowResults(true);
    }
  }, [state.status]);

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
      const currentStep = selectedDialogue?.steps.find(
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

  const handleReplay = () => {
    setMessages([]);
    setShowResults(false);
    setMachineKey((prev) => prev + 1);
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  const getCurrentStep = () => {
    if (!selectedDialogue || !state.value) return null;
    return selectedDialogue.steps.find((step) => step.id === state.value);
  };

  const getScores = () => {
    return {
      clarity: state.context?.clarity || 0,
      empathy: state.context?.empathy || 0,
      assertiveness: state.context?.assertiveness || 0,
      socialAwareness: state.context?.socialAwareness || 0,
      selfAdvocacy: state.context?.selfAdvocacy || 0,
    };
  };

  if (loading || dialoguesLoading) {
    return (
      <div className="play-scenario-container">
        <div className="game-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading scenario...</p>
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

  if (!selectedDialogue) {
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
                  onClick={() => setSelectedDialogue(dialogue)}
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

  const currentStep = getCurrentStep();
  const scores = getScores();

  return (
    <div className="play-scenario-container">
      <div className="game-header">
        <div className="header-content">
          <div className="scenario-info">
            <h1 className="scenario-title">{scenario.title}</h1>
            <div className="scenario-badge">{selectedDialogue.title}</div>
          </div>
          <div className="game-controls">
            <button className="control-btn">
              <Volume2 size={20} />
            </button>
            <button className="control-btn">
              <Settings size={20} />
            </button>
            <button onClick={handleReplay} className="control-btn">
              <RotateCcw size={20} />
            </button>
            <button onClick={handleExit} className="control-btn danger">
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="dialogue-arena">
          <div className="chat-window">
            <div className="chat-messages">
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

              <div ref={messagesEndRef} />
            </div>

            <div className="response-section">
              {currentStep?.options && currentStep.options.length > 0 && (
                <>
                  <div className="response-prompt">
                    <h3>How do you respond?</h3>
                    <p>
                      Choose your response carefully - it affects your social
                      skills score!
                    </p>
                  </div>

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
        </div>
      </div>

      <div className={`results-overlay ${showResults ? "visible" : ""}`}>
        <div className={`results-card ${showResults ? "visible" : ""}`}>
          <div className="results-header">
            <div className="results-icon">
              <Award size={32} />
            </div>
            <h2>Great Job!</h2>
            <p>You've completed the dialogue. Here's how you performed:</p>
          </div>

          <div className="score-grid">
            <div className="score-item">
              <div className="score-label">Clarity</div>
              <div className="score-value">{scores.clarity}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Empathy</div>
              <div className="score-value">{scores.empathy}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Assertiveness</div>
              <div className="score-value">{scores.assertiveness}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Social Awareness</div>
              <div className="score-value">{scores.socialAwareness}</div>
            </div>
          </div>

          <div className="results-actions">
            <button onClick={handleReplay} className="btn btn-primary">
              <RotateCcw size={20} />
              Try Again
            </button>
            <button onClick={handleExit} className="btn">
              <Home size={20} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayScenarioPage;
