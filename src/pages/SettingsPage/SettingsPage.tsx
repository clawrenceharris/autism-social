import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useToast, useModal } from "../../context";
import { signOut } from "../../services/auth";
import { ConfirmationModal } from "../../components/";
import {
  User,
  Palette,
  Shield,
  Trash2,
  LogOut,
  RotateCcw,
  History,
  Edit3,
} from "lucide-react";
import "./SettingsPage.scss";
import EditProfile from "../../components/EditProfile/EditProfile";

type ColorScheme = "light" | "dark" | "auto";

const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleLogout = async () => {
    openModal(
      <ConfirmationModal
        message="Are you sure you want to log out? Any unsaved changes will be lost."
        confirmText="Log Out"
        onConfirm={async () => {
          try {
            await signOut();
            showToast("Logged out successfully", "success");
            navigate("/login", { replace: true });
            closeModal();
          } catch {
            showToast("Failed to log out", "error");
          }
        }}
      />,
      "Confirm Logout"
    );
  };

  const handleDeleteAccount = () => {
    openModal(
      <ConfirmationModal
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete Account"
        onConfirm={() => {
          // TODO: Implement account deletion
          showToast("Account deletion is not yet implemented", "info");
        }}
      />,
      "Delete Account"
    );
  };

  const handleResetProgress = () => {
    openModal(
      <ConfirmationModal
        message="Are you sure you want to reset all your progress? This will clear your scenario history and scores."
        confirmText="Reset Progress"
        onConfirm={() => {
          // TODO: Implement progress reset
          showToast("Progress reset is not yet implemented", "info");
        }}
      />,
      "Reset Progress"
    );
  };

  const handleManageHistory = () => {
    // TODO: Navigate to history management page
    showToast("History management is not yet implemented", "info");
  };

  const handleEditProfile = () => {
    // TODO: Open edit profile modal or navigate to edit page
    openModal(<EditProfile />, "Edit Profile");
    showToast("Edit profile is not yet implemented", "info");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="description">
          Manage your account, preferences, and app settings
        </p>
      </div>

      <div className="settings-sections">
        {/* Profile Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Profile</h2>
            <User className="section-icon" size={24} />
          </div>
          <div className="section-content">
            <div className="profile-info">
              <div className="profile-avatar">
                {user?.email ? getInitials(user.email) : "U"}
              </div>
              <div className="profile-details">
                <div className="profile-name">
                  {user?.user_metadata?.name || "User"}
                </div>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Edit Profile</div>
                <p className="setting-description">
                  Update your name, goals, interests, and profile photo
                </p>
              </div>
              <div className="setting-control">
                <button onClick={handleEditProfile} className="btn btn-primary">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Appearance</h2>
            <Palette className="section-icon" size={24} />
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Color Scheme</div>
                <p className="setting-description">
                  Choose your preferred color scheme for the app
                </p>
              </div>
            </div>
            <div className="color-scheme-options">
              <div
                className={`color-option ${
                  colorScheme === "light" ? "selected" : ""
                }`}
                onClick={() => setColorScheme("light")}
              >
                <div className="color-preview light"></div>
                <span className="color-label">Light</span>
              </div>
              <div
                className={`color-option ${
                  colorScheme === "dark" ? "selected" : ""
                }`}
                onClick={() => setColorScheme("dark")}
              >
                <div className="color-preview dark"></div>
                <span className="color-label">Dark</span>
              </div>
              <div
                className={`color-option ${
                  colorScheme === "auto" ? "selected" : ""
                }`}
                onClick={() => setColorScheme("auto")}
              >
                <div className="color-preview auto"></div>
                <span className="color-label">Auto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Preferences</h2>
            <Shield className="section-icon" size={24} />
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Notifications</div>
                <p className="setting-description">
                  Receive notifications about progress and new scenarios
                </p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Auto-save Progress</div>
                <p className="setting-description">
                  Automatically save your progress during scenarios
                </p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Data Management</h2>
            <History className="section-icon" size={24} />
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Manage History</div>
                <p className="setting-description">
                  View and manage your scenario completion history
                </p>
              </div>
              <div className="setting-control">
                <button onClick={handleManageHistory} className="btn">
                  <History size={16} />
                  View History
                </button>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Reset Progress</div>
                <p className="setting-description">
                  Clear all your progress and start fresh
                </p>
              </div>
              <div className="setting-control">
                <button onClick={handleResetProgress} className="btn warning">
                  <RotateCcw size={16} />
                  Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Account</h2>
            <User className="section-icon" size={24} />
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Log Out</div>
                <p className="setting-description">
                  Sign out of your account on this device
                </p>
              </div>
              <div className="setting-control">
                <button onClick={handleLogout} className="btn">
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>

            <div className="danger-zone">
              <div className="danger-header">
                <h3>Danger Zone</h3>
                <p>
                  These actions cannot be undone. Please proceed with caution.
                </p>
              </div>
              <div className="danger-actions">
                <button onClick={handleDeleteAccount} className="btn danger">
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
