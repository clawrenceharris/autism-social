import { Link } from "react-router-dom";
import { assets } from "../../constants/assets";
import {
  Brain,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import "./LandingPage.scss";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Expanded dialogue samples with more options
const dialogueSamples = [
  {
    id: 1,
    npc: "So, what does your perfect date look like?",
    options: [
      "I don't know, maybe a movie or something?",
      "I prefer to keep it simple...",
      "Being with someone I care about is enough for me.",
      "Something outdoors where we can talk and connect."
    ],
  },
  {
    id: 2,
    npc: "Your friend seems upset but hasn't said anything. What might you say?",
    options: [
      "I've noticed you seem quiet today. Is everything okay?",
      "I'm here if you want to talk about anything.",
      "Sometimes it helps to share what's bothering you.",
      "Would you like to talk about what's on your mind?"
    ],
  },
  {
    id: 3,
    npc: "Why do you want to work here?",
    options: [
      "I just really need a job right now.",
      "Your company mission resonates with me.",
      "I've always admired the work your team does.",
      "My skills align perfectly with what you're looking for."
    ],
  },
  {
    id: 4,
    npc: "I'm sorry, but we can't accept returns without a receipt.",
    options: [
      "But I just bought it yesterday!",
      "I understand. Is there any other way to verify my purchase?",
      "Can I speak to your manager please?",
      "That's fine, I'll try to find the receipt at home."
    ],
  },
  {
    id: 5,
    npc: "Would you like to join us for dinner this weekend?",
    options: [
      "I'll have to check my schedule first.",
      "Yes, I'd love to! What time should I come?",
      "That sounds nice, but I'm not sure if I can make it.",
      "Thank you for the invitation. I'll let you know tomorrow."
    ],
  }
];

const LandingPage = () => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Change dialogue every 8 seconds
    const intervalId = setInterval(() => {
      setIsVisible(false);
      
      // After exit animation completes, change to next dialogue
      setTimeout(() => {
        setCurrentDialogueIndex((prevIndex) => 
          (prevIndex + 1) % dialogueSamples.length
        );
        setIsVisible(true);
      }, 500); // Match this with exit animation duration
      
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  const currentDialogue = dialogueSamples[currentDialogueIndex];

  return (
    <div className="landing-page ">
      <header className="landing-header">
        <Link to="/" className="brand">
          <img
            src={assets.logo_secondary}
            alt="Chatterbrain Logo"
            className="logo"
          />
        </Link>
        <div className="content-row">
          <Link to="/login" className="btn btn-tertiary">
            Log In
          </Link>
          <Link to="/signup" className="btn btn-special">
            Get Started
          </Link>
        </div>
      </header>
      <div>
        <div className="hero-container">
          <div className="hero-content">
            <div>
              <img
                className="logo"
                src={assets.logo_primary}
                alt="Chatterbrain Logo"
              />

              <h1 className="hero-text">
                <strong> Demystify </strong>social settings,
                <span>
                  <strong>Boost</strong> social skills.
                </span>
              </h1>
            </div>
            
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.div
                  key={currentDialogue.id}
                  className="dialogue-sample"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="message npc"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="message-content">
                      <div className="message-bubble">{currentDialogue.npc}</div>
                    </div>
                  </motion.div>
                  <div className="response-options">
                    {currentDialogue.options.map((option, optIndex) => (
                      <motion.div 
                        key={optIndex} 
                        className="response-option"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.4 + (optIndex * 0.1) // Stagger the animations
                        }}
                      >
                        <p className="option-text">{option}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <img
              className="hero-image"
              src={assets.hero_bubbles}
              alt="A 3D illustration of two large chat bubbles overlapping"
            />
          </div>
        </div>

        <div className="landing-container container">
          <div className="landing-content">
            <div className="benefits-section">
              <h2>What you can expect...</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <Brain size={32} />
                  </div>
                  <h3>Personalized Learning</h3>
                  <p>
                    Scenarios tailored to your specific goals and interests,
                    with adaptive difficulty levels.
                  </p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <MessageSquare size={32} />
                  </div>
                  <h3>Realistic Dialogues</h3>
                  <p>
                    Practice with lifelike conversations that prepare you for
                    real-world social situations.
                  </p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <Users size={32} />
                  </div>
                  <h3>Supportive Community</h3>
                  <p>
                    Join a community of users working together to improve social
                    skills and confidence.
                  </p>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <div>
                <h2>Ready to start practicing?</h2>
                <p>
                  Join thousands of chatterbrains who are building better social
                  skills now!
                </p>
                <div className="feature-list">
                  <div className="feature-item">
                    <CheckCircle className="feature-icon" />
                    <span>Realistic conversation practice</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle className="feature-icon" />
                    <span>Personalized feedback and scoring</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle className="feature-icon" />
                    <span>Track your progress over time</span>
                  </div>
                </div>

                <Link to="/signup" className="btn btn-special">
                  <Sparkles size={20} />
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img
              src={assets.logo_secondary}
              alt="Chatterbrain Logo"
              className="footer-logo"
            />
            <button style={{ color: "#fff" }}>Chatterbrain</button>
          </div>
          <div className="footer-links">
            <Link to="/dashboard">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Chatterbrain. All rights reserved.
          </div>
        </div>
      </footer>
      <div className="animated-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="gradient-blob blob-4"></div>
        <div className="gradient-blob blob-5"></div>
        <div className="gradient-blob blob-6"></div>
      </div>
    </div>
  );
};

export default LandingPage;