import { Link, NavLink } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Settings } from "lucide-react";
import "./RootHeader.scss";
import { assets } from "../../constants/assets";

const RootHeader = () => {
  return (
    <header>
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <img className="logo" src={assets.logo} alt="Logo" />
        </Link>

        <div className="nav-links">
          <NavLink to="/" className="nav-link">
            {({ isActive }) => (
              <div className={`nav-link ${isActive ? "active" : ""}`}>
                <Home />
                <span>Dashboard</span>
              </div>
            )}
          </NavLink>

          <NavLink to="/your-scenarios">
            {({ isActive }) => (
              <div className={`nav-link ${isActive ? "active" : ""}`}>
                <BookOpen />
                <span>Scenarios</span>
              </div>
            )}
          </NavLink>
          <NavLink to="/progress">
            {({ isActive }) => (
              <div className={`nav-link ${isActive ? "active" : ""}`}>
                <TrendingUp />
                <span>Progress</span>
              </div>
            )}
          </NavLink>

          <NavLink to="/settings" className="nav-link">
            {({ isActive }) => (
              <div className={`nav-link${isActive ? "active" : ""}`}>
                <Settings />
                <span>Settings</span>
              </div>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default RootHeader;
