import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useModal } from "../../context";
import { signOut } from "../../services/auth";
import { ConfirmationModal, EditProfile } from "../../components/";
import { User, Palette, LogOut, History, Trash, Hammer } from "lucide-react";
import "./SettingsPage.scss";
import { useToast } from "../../context";
import type { AuthContextType } from "../../types";
import { useErrorHandler } from "../../hooks";
import { deleteUserProfile } from "../../services/user";
import EditAccount from "../../components/EditAccount";

type ColorScheme = "light" | "dark" | "auto";

const SettingsPage = () => {
  const { user, profile } = useOutletContext<AuthContextType>();
  const { showToast } = useToast();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const { handleAsyncError } = useErrorHandler({ component: "SettingsPage" });
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
      closeModal();
    } catch {
      showToast("Failed to log out", { type: "error" });
    }
  };

  const handleDeleteAccount = () => {
    openModal(
      <ConfirmationModal
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete Account"
        onConfirm={() => {
          handleAsyncError({
            action: "delete account",
            asyncFn: async () => {
              await deleteUserProfile(user.id);
            },
          });
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
          showToast("Progress reset is not yet implemented", { type: "info" });
        }}
      />,
      "Reset Progress"
    );
  };

  const handleManageHistory = () => {
    // TODO: Navigate to history management page
    showToast("History management is not yet implemented", { type: "info" });
  };

  const handleEditProfile = () => {
    openModal(
      <EditProfile user={user} onSubmit={closeModal} />,
      "Edit Profile"
    );
  };
  const handleEditAccount = () => {
    openModal(
      <EditAccount user={user} onSubmit={closeModal} />,
      "Edit Account"
    );
  };
  const getInitials = (firstName: string, lastName: string) => {
    return firstName.charAt(0) + lastName.charAt(0);
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
        <div className="card-section">
          <div className="section-header">
            <h2>
              <User className="section-icon" size={24} />
              Your Account
            </h2>
          </div>
          <div className="section-content">
            <div className="profile-info">
              <div className="profile-avatar">
                {getInitials(profile.first_name, profile.last_name)}
              </div>
              <div className="profile-details">
                <div className="profile-name">
                  {profile.first_name + " " + profile.last_name || ""}
                </div>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Edit Account</h3>
                <p className="description">
                  Update your goals, interests, and profile photo
                </p>
              </div>
              <div onClick={handleEditAccount} className="setting-control">
                <button
                  onClick={handleEditAccount}
                  className="btn btn-tertiary"
                >
                  Edit Account
                </button>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Edit Profile</h3>
                <p className="description">
                  Update your goals, interests, and profile photo
                </p>
              </div>
              <button onClick={handleEditProfile} className="btn btn-primary">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card-section">
          <div className="section-header">
            <h2>
              <Palette className="section-icon" size={24} />
              Appearance
            </h2>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Color Scheme</h3>
                <p className="description">
                  Choose your preferred color scheme for the app
                </p>
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
        </div>

        {/* Data Management Section */}
        <div className="card-section">
          <div className="section-header">
            <h2>
              <History className="section-icon" size={24} />
              Data Management
            </h2>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Manage History</h3>
                <p className="description">
                  View and manage your scenario completion history
                </p>
              </div>
              <button
                onClick={handleManageHistory}
                className="btn btn-tertiary"
              >
                View History
              </button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Reset Progress</h3>
                <p className="description">
                  Clear all your progress and start fresh
                </p>
              </div>
              <button onClick={handleResetProgress} className="btn btn-warning">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="card-section">
          <div className="section-header">
            <h2>
              <Hammer className="section-icon" size={24} />
              Account Actions
            </h2>
          </div>
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Log Out</h3>
                <p className="description">
                  Sign out of your account on this device
                </p>
              </div>
              <div className="setting-control">
                <button className="btn btn-tertiary" onClick={handleLogout}>
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>

            <div className="section-content">
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-label danger">Delete Account</h3>
                  <p className="description">
                    Delete your account and all its data. This action is
                    irreversible
                  </p>
                </div>
                <div className="setting-control">
                  <button
                    onClick={handleDeleteAccount}
                    className="btn btn-danger"
                  >
                    <Trash size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
