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
import { useState } from "react";

const dialogueSamples1 = [
  {
    id: 1,
    actorLine: "So, what does your perfect date look like?",
    options: [
      "I don't know, maybe a movie or something?",
      "I prefer to keep it simple...",
      "Being with someone I care about is enough for me.",
    ],
  },
  {
    id: 2,
    actorLine: "I lost my dog yesterday. I've never felt this broken...",
    options: [
      "Oh no. I'm sorry...",

      "That's awful. Do you want to talk about it?",
      "[Stays Silent]",
    ],
  },
  {
    id: 3,
    actorLine: "Why do you want to work here?",
    options: [
      "I just really need a job right now.",
      "Your company mission resonates with me.",
      "My skills align perfectly with what you're looking for.",
    ],
  },
];

const dialogueSamples2 = [
  {
    id: 1,
    actorLine: "I'm sorry, but we can't accept returns without a receipt.",
    options: [
      "Can I speak to your manager please?",
      "I understand. Is there any other way to verify my purchase?",

      "Oh, give me a break!",
    ],
  },
  {
    id: 2,
    actorLine: "Would you like to join us for dinner tonight?",
    options: [
      "Yes, I'd love to! What time should I come?",
      "I'd rather starve.",
      "Thank you for the invitation. I'll let you know tomorrow.",
    ],
  },
  {
    id: 3,
    actorLine:
      "Hi, I'm new to the team. What's a typical day like around here?",
    options: [
      "It's pretty busy, you'll see.",
      "We usually start with a team huddle, then it's mostly independent work.",
      "Terrible!",
    ],
  },
];
const LandingPage = () => {
  const [currentDialogueIndex1, setCurrentDialogueIndex1] = useState(0);
  const [showDialogue1, setShowDialogue1] = useState(true);
  const [isAnimating1, setIsAnimating1] = useState(false);
  const dialogue1 = dialogueSamples1[currentDialogueIndex1];

  // State for the second dialogue set
  // Start the second dialogue from a different index to show variety immediately
  const [currentDialogueIndex2, setCurrentDialogueIndex2] = useState(1);
  const [showDialogue2, setShowDialogue2] = useState(true);
  const [isAnimating2, setIsAnimating2] = useState(false);
  const dialogue2 = dialogueSamples2[currentDialogueIndex2];
  const handleNextDialogue = (dialogueNum: 1 | 2) => {
    // Determine which dialogue set is being clicked
    const currentIsAnimating = dialogueNum === 1 ? isAnimating1 : isAnimating2;
    if (currentIsAnimating) return; // Prevent multiple clicks during animation for this specific dialogue

    // Set animating state to true for the specific dialogue
    if (dialogueNum === 1) {
      setIsAnimating1(true);
      setShowDialogue1(false); // Trigger exit animation for dialogue 1
    } else {
      setIsAnimating2(true);
      setShowDialogue2(false); // Trigger exit animation for dialogue 2
    }

    const animationDuration = 500; // Matches transition duration
    const reEntryDelay = 100; // Small buffer before new entry

    setTimeout(() => {
      if (dialogueNum === 1) {
        // Update to the next dialogue index for set 1
        setCurrentDialogueIndex1(
          (prevIndex) => (prevIndex + 1) % dialogueSamples1.length
        );
        setShowDialogue1(true); // Trigger enter animation for new dialogue 1
        setTimeout(() => {
          setIsAnimating1(false);
        }, animationDuration);
      } else {
        // Update to the next dialogue index for set 2
        setCurrentDialogueIndex2(
          (prevIndex) => (prevIndex + 1) % dialogueSamples2.length
        );
        setShowDialogue2(true); // Trigger enter animation for new dialogue 2
        setTimeout(() => {
          setIsAnimating2(false);
        }, animationDuration);
      }
    }, animationDuration + reEntryDelay);
  };

  return (
    <div className="landing-page ">
      <header className="landing-header">
        <Link to="/" className="brand">
          <img
            src={assets.logo_secondary}
            alt="Chatterbrain Logo"
            className="logo small"
          />
        </Link>
        <div className="flex-content">
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
              {showDialogue1 && (
                <div className="dialogue-sample" key={dialogue1.id}>
                  <motion.div
                    className="message npc"
                    initial={{ x: "200%" }}
                    exit={{ x: "200%" }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="message-content">
                      <div className="message-bubble">
                        {dialogue1.actorLine}
                      </div>
                    </div>
                  </motion.div>
                  <div className="response-options">
                    {dialogue1.options.map((option, optIndex) => (
                      <motion.div
                        key={optIndex}
                        onClick={() => handleNextDialogue(1)}
                        className="response-option"
                        initial={{ x: "200%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "200%" }}
                        transition={{
                          duration: 0.3,
                          delay: 0.1 + optIndex * 0.1, // Stagger the animations
                        }}
                      >
                        <p className="option-text">{option}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {showDialogue2 && (
                <div className="dialogue-sample" key={dialogue2.id}>
                  <motion.div
                    className="message npc"
                    initial={{ x: "-200%" }}
                    exit={{ x: "-200%" }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="message-content">
                      <div className="message-bubble">
                        {dialogue2.actorLine}
                      </div>
                    </div>
                  </motion.div>
                  <div className="response-options">
                    {dialogue2.options.map((option, optIndex) => (
                      <motion.div
                        onClick={() => handleNextDialogue(2)}
                        key={optIndex}
                        className="response-option"
                        initial={{ x: "-200%" }}
                        exit={{ x: "-200%" }}
                        animate={{ x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.1 + optIndex * 0.1, // Stagger the animations
                        }}
                      >
                        <p className="option-text">{option}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
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
          <div className="brand">
            <Link to={"/"}>
              <img
                src={assets.logo_primary}
                alt="Chatterbrain Logo"
                className="logo"
              />
            </Link>

            <Link to={"https://bolt.new"}>
              <img className="logo" src={assets.bolt_badge} />
            </Link>
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
