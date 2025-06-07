import { Link } from "react-router-dom";
import { Home, FolderOpen, Settings } from "lucide-react";
import "../../styles/shared/_header.scss";
import { assets } from "../../constants/assets";

const AdminHeader = () => {
  return (
    <nav className="taskbar">
      <div className="taskbar-container">
        <Link to="/" className="taskbar-brand">
          <img className="logo" src={assets.logo} alt="Logo" />
          <span>Autism Social</span>
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

export default AdminHeader;
