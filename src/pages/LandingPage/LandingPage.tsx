import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../constants/assets";
import { Brain, CheckCircle, MessageSquare, Users, Sparkles } from "lucide-react";
import "./LandingPage.scss";

const dialogueSamples = [
  {
    npc: "How would you respond to a colleague who keeps interrupting you during meetings?",
    options: [
      "I'd politely ask if I could finish my thought first.",
      "I'd stay silent and let them talk.",
      "I'd interrupt them back to make a point."
    ]
  },
  {
    npc: "Your friend seems upset but hasn't said anything. What might you say?",
    options: [
      "I've noticed you seem quiet today. Is everything okay?",
      "I'm here if you want to talk about anything.",
      "Sometimes it helps to share what's bothering you."
    ]
  },
  {
    npc: "How would you decline an invitation to an event you don't want to attend?",
    options: [
      "Thank you for thinking of me, but I won't be able to make it.",
      "I appreciate the invitation, but I have other plans.",
      "I'm not feeling up to it, but maybe next time."
    ]
  },
  {
    npc: "Your roommate left a mess in the kitchen again. How do you address it?",
    options: [
      "Could we talk about keeping the kitchen clean?",
      "I noticed the kitchen is messy. Do you have time to clean up?",
      "It would help me if you could clean up after cooking."
    ]
  }
];

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState<number[]>([0]);

  useEffect(() => {
    // Gradually reveal dialogue bubbles for a staggered effect
    const timer = setTimeout(() => {
      setVisibleBubbles([0, 1]);
      
      setTimeout(() => {
        setVisibleBubbles([0, 1, 2]);
        
        setTimeout(() => {
          setVisibleBubbles([0, 1, 2, 3]);
        }, 1000);
      }, 1000);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be implemented later
    console.log({ email, password, isLogin });
  };

  return (
    <div className="landing-page">
      <div className="animated-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="gradient-blob blob-4"></div>
      </div>
      
      <header className="landing-header">
        <div className="brand">
          <img src={assets.logo} alt="Chatterbrain Logo" className="logo" />
          <h1>Chatterbrain</h1>
        </div>
        <div className="header-actions">
          <button className="btn-text" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account?" : "Already have an account?"}
          </button>
        </div>
      </header>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Practice Social Interactions in a Safe Environment</h2>
            <p className="hero-description">
              Chatterbrain helps you build social confidence through
              interactive dialogue scenarios designed specifically for
              neurodivergent individuals.
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
            <Link to="/signup" className="btn btn-primary hero-cta">
              <Sparkles size={20} />
              Get Started Free
            </Link>
          </div>

          <div className="auth-card">
            <h3>{isLogin ? "Welcome Back" : "Get Started Today"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="dialogue-bubbles-container">
        <div className="dialogue-bubbles">
          {dialogueSamples.map((dialogue, index) => (
            visibleBubbles.includes(index) && (
              <div key={index} className={`dialogue-sample ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="message npc">
                  <div className="message-content">
                    <div className="message-bubble">{dialogue.npc}</div>
                  </div>
                </div>
                <div className="response-options">
                  {dialogue.options.map((option, optIndex) => (
                    <div key={optIndex} className="response-option">
                      <p className="option-text">{option}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="landing-container container">
        <div className="landing-content">
          <div className="benefits-section">
            <h2>Why Choose Chatterbrain?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <Brain size={32} />
                </div>
                <h3>Personalized Learning</h3>
                <p>
                  Scenarios tailored to your specific goals and interests, with
                  adaptive difficulty levels.
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
            <h2>Ready to improve your social confidence?</h2>
            <p>
              Join thousands of users who are building better social skills with
              Chatterbrain.
            </p>
            <button
              className="btn btn-secondary cta-button"
              onClick={() => setIsLogin(false)}
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </div>
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img
              src={assets.logo}
              alt="Chatterbrain Logo"
              className="footer-logo"
            />
            <span>Chatterbrain</span>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Chatterbrain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;