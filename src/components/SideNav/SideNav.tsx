import { Link, NavLink } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Settings } from "lucide-react";
import "./SideNav.scss";
import { assets } from "../../constants/assets";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuth } from "../../context";

const SideNav = () => {
  const { profile } = useProfileStore();
  const { user } = useAuth();

  // Get user initials for avatar
  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`;
  };

  return (
    <aside className="side-nav">
      <div className="nav-content">
        {user && profile && (
          <div className="profile-box">
            <div className="content-row">
              <div className="profile-avatar">
                {getInitials(profile.first_name, profile.last_name)}
              </div>
              <div className="profile-info">
                <div className="profile-name">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="profile-email">{user?.email}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="nav-links">
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
        </nav>
        <div className="flex-content">
          <div className="nav-brand small">
            <img
              className="logo"
              src={assets.logo_secondary}
              alt="Chatterbrain Logo"
            />
          </div>
          <Link to={"https://bolt.new"} className="nav-brand">
            <img className="logo" src={assets.bolt_badge} />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
