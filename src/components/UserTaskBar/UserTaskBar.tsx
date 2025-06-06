import { Link } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Settings, Compass } from "lucide-react";
import "../../styles/_taskbar.scss";

const UserTaskBar = () => {
  return (
    <nav className="taskbar">
      <div className="taskbar-container">
        <Link to="/dashboard" className="taskbar-brand">
          <Home size={24} />
          <span>Dialogue App</span>
        </Link>

        <div className="taskbar-nav">
          <Link to="/dashboard" className="taskbar-link">
            <Home />
            <span>Dashboard</span>
          </Link>
          <Link to="/your-scenarios" className="taskbar-link">
            <BookOpen />
            <span>Your Scenarios</span>
          </Link>
          <Link to="/progress" className="taskbar-link">
            <TrendingUp />
            <span>Progress</span>
          </Link>
          <Link to="/customization" className="taskbar-link">
            <Settings />
            <span>Customization</span>
          </Link>
          <Link to="/explore" className="taskbar-link">
            <Compass />
            <span>Explore</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default UserTaskBar;
