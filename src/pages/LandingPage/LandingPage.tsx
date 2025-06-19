import { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../constants/assets";
import { Brain, CheckCircle, MessageSquare, Users } from "lucide-react";
import "./LandingPage.scss";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be implemented later
    console.log({ email, password, isLogin });
  };

  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="brand">
          <img src={assets.logo} alt="Chatterbrain Logo" className="logo" />
          <h1>Chatterbrain</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-text" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Need an account?" : "Already have an account?"}
          </button>
        </div>
      </div>

      <div className="landing-content">
        <div className="hero-section">
          <div className="hero-text">
            <h2>Practice Social Interactions in a Safe Environment</h2>
            <p className="hero-description">
              Chatterbrain helps you build social confidence through interactive dialogue scenarios designed specifically for autistic individuals.
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

        <div className="benefits-section">
          <h2>Why Choose Chatterbrain?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <Brain size={32} />
              </div>
              <h3>Personalized Learning</h3>
              <p>
                Scenarios tailored to your specific goals and interests, with adaptive difficulty levels.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <MessageSquare size={32} />
              </div>
              <h3>Realistic Dialogues</h3>
              <p>
                Practice with lifelike conversations that prepare you for real-world social situations.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Users size={32} />
              </div>
              <h3>Supportive Community</h3>
              <p>
                Join a community of users working together to improve social skills and confidence.
              </p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to improve your social confidence?</h2>
          <p>
            Join thousands of users who are building better social skills with Chatterbrain.
          </p>
          <button 
            className="btn btn-primary cta-button"
            onClick={() => setIsLogin(false)}
          >
            Get Started for Free
          </button>
        </div>
      </div>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={assets.logo} alt="Chatterbrain Logo" className="footer-logo" />
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