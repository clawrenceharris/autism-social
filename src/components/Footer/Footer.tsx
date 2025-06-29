import { assets } from "../../constants/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
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
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">About</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Terms</Link>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} Chatterbrain. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
