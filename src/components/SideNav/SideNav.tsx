import { NavLink } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Settings } from "lucide-react";
import "./SideNav.scss";
import { assets } from "../../constants/assets";

const SideNav = () => {
  return (
    <aside className="side-nav">
      <div className="nav-content">
        <div className="nav-brand">
          <img
            className="logo"
            src={assets.logo_primary}
            alt="Chatterbrain Logo"
          />
        </div>

        <div className="nav-links">
          <NavLink to="/dashboard" className="nav-link">
            {({ isActive }) => (
              <div className={`nav-link-inner ${isActive ? "active" : ""}`}>
                <Home />
                <span>Dashboard</span>
              </div>
            )}
          </NavLink>

          <NavLink to="/scenarios" className="nav-link">
            {({ isActive }) => (
              <div className={`nav-link-inner ${isActive ? "active" : ""}`}>
                <BookOpen />
                <span>Scenarios</span>
              </div>
            )}
          </NavLink>
          
          <NavLink to="/progress" className="nav-link">
            {({ isActive }) => (
              <div className={`nav-link-inner ${isActive ? "active" : ""}`}>
                <TrendingUp />
                <span>Progress</span>
              </div>
            )}
          </NavLink>

          <NavLink to="/settings" className="nav-link">
            {({ isActive }) => (
              <div className={`nav-link-inner ${isActive ? "active" : ""}`}>
                <Settings />
                <span>Settings</span>
              </div>
            )}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;