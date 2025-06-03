import { Link } from "react-router-dom";
import { Home, FolderOpen, Settings, Zap } from "lucide-react";
import "./TaskBar.css";

const TaskBar = () => {
  return (
    <nav className="taskbar">
      <div className="taskbar-container">
        <Link to="/" className="taskbar-brand">
          <Zap size={24} />
          <span>Scenario Builder</span>
        </Link>
        
        <div className="taskbar-nav">
          <Link to="/" className="taskbar-link">
            <Home />
            <span>Home</span>
          </Link>
          <Link to="/scenarios" className="taskbar-link">
            <FolderOpen />
            <span>Scenarios</span>
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

export default TaskBar;