import { Link } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Settings } from "lucide-react";
import "../../styles/shared/_header.scss";
import { assets } from "../../constants/assets";

const UserHeader = () => {
  return (
    <nav className="taskbar">
      <div className="taskbar-container">
        <Link to="/dashboard" className="taskbar-brand">
          <img className="logo" src={assets.logo} alt="Logo" />
          <span>Autism Social</span>
        </Link>

        <div className="taskbar-nav">
          <Link to="/" className="taskbar-link">
            <Home />
            <span>Dashboard</span>
          </Link>
          <Link to="/your-scenarios" className="taskbar-link">
            <BookOpen />
            <span>Scenarios</span>
          </Link>
          <Link to="/progress" className="taskbar-link">
            <TrendingUp />
            <span>Progress</span>
          </Link>
          <Link to="/settings" className="taskbar-link">
            <Settings />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
