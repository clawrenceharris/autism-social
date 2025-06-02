import { Link } from "react-router-dom";
import { Home, FolderOpen, Settings } from "lucide-react";
import "./TaskBar.css";

const TaskBar = () => {
  return (
    <nav className="taskbar">
      <div className="taskbar-container">
        <div className="taskbar-nav">
          <Link to="/" className="taskbar-link">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/scenarios" className="taskbar-link">
            <FolderOpen size={20} />
            <span>Scenarios</span>
          </Link>
          <Link to="/settings" className="taskbar-link">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TaskBar;
