import { NavLink, useOutletContext } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Settings } from "lucide-react";
import "./SideNav.scss";
import { assets } from "../../constants/assets";
import type { AuthContextType } from "../routes";

const SideNav = () => {
  const context = useOutletContext<AuthContextType>();
  const profile = context?.profile;
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!profile) return "U";
    return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
  };

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
        
        {profile && (
          <div className="profile-box">
            <div className="profile-avatar">{getInitials()}</div>
            <div className="profile-info">
              <div className="profile-name">{profile.first_name} {profile.last_name}</div>
              <div className="profile-email">{context?.user?.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideNav;