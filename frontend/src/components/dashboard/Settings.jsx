import { useState } from "react";
import { FaSave, FaBell, FaLock, FaUser, FaPalette, FaDatabase } from "react-icons/fa";
import API from "../../api";
import toast from "react-hot-toast";
import "./Settings.css";

const Settings = () => {
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const [loading, setLoading] = useState(false);
  
  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    name: localStorage.getItem("userName") || "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    securityAlerts: true,
  });

  // Admin Settings
  const [adminSettings, setAdminSettings] = useState({
    allowRegistration: true,
    requireEmailVerification: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    language: "en",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleAdminChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (profileSettings.newPassword) {
      if (profileSettings.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (profileSettings.newPassword !== profileSettings.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);
      // API call would go here
      toast.success("Profile updated successfully");
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // API call would go here
      toast.success("Notification settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // API call would go here
      toast.success("Admin settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAppearanceSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // API call would go here
      toast.success("Appearance settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="settings-grid">
        {/* Profile Settings */}
        <div className="settings-card">
          <div className="card-header">
            <FaUser className="card-icon" />
            <h3>Profile Settings</h3>
          </div>
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileSettings.name}
                onChange={handleProfileChange}
                className="form-input"
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileSettings.email}
                onChange={handleProfileChange}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="divider"></div>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={profileSettings.currentPassword}
                onChange={handleProfileChange}
                className="form-input"
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={profileSettings.newPassword}
                onChange={handleProfileChange}
                className="form-input"
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={profileSettings.confirmPassword}
                onChange={handleProfileChange}
                className="form-input"
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-save">
              <FaSave />
              Save Changes
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <div className="card-header">
            <FaBell className="card-icon" />
            <h3>Notifications</h3>
          </div>
          <form onSubmit={handleNotificationSubmit} className="settings-form">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <div>
                  <span className="checkbox-label">Email Notifications</span>
                  <span className="checkbox-description">Receive email updates</span>
                </div>
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onChange={handleNotificationChange}
                />
                <div>
                  <span className="checkbox-label">Push Notifications</span>
                  <span className="checkbox-description">Receive push notifications</span>
                </div>
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="weeklyReport"
                  checked={notificationSettings.weeklyReport}
                  onChange={handleNotificationChange}
                />
                <div>
                  <span className="checkbox-label">Weekly Report</span>
                  <span className="checkbox-description">Get weekly activity summary</span>
                </div>
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="securityAlerts"
                  checked={notificationSettings.securityAlerts}
                  onChange={handleNotificationChange}
                />
                <div>
                  <span className="checkbox-label">Security Alerts</span>
                  <span className="checkbox-description">Important security notifications</span>
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-save">
              <FaSave />
              Save Changes
            </button>
          </form>
        </div>

        {/* Appearance Settings */}
        <div className="settings-card">
          <div className="card-header">
            <FaPalette className="card-icon" />
            <h3>Appearance</h3>
          </div>
          <form onSubmit={handleAppearanceSubmit} className="settings-form">
            <div className="form-group">
              <label>Theme</label>
              <select
                name="theme"
                value={appearanceSettings.theme}
                onChange={handleAppearanceChange}
                className="form-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language</label>
              <select
                name="language"
                value={appearanceSettings.language}
                onChange={handleAppearanceChange}
                className="form-input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-save">
              <FaSave />
              Save Changes
            </button>
          </form>
        </div>

        {/* Admin Settings - Only for Admin */}
        {isAdmin && (
          <div className="settings-card">
            <div className="card-header">
              <FaLock className="card-icon" />
              <h3>Admin Settings</h3>
            </div>
            <form onSubmit={handleAdminSubmit} className="settings-form">
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="allowRegistration"
                    checked={adminSettings.allowRegistration}
                    onChange={handleAdminChange}
                  />
                  <div>
                    <span className="checkbox-label">Allow Registration</span>
                    <span className="checkbox-description">Allow new users to register</span>
                  </div>
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={adminSettings.requireEmailVerification}
                    onChange={handleAdminChange}
                  />
                  <div>
                    <span className="checkbox-label">Email Verification</span>
                    <span className="checkbox-description">Require email verification</span>
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={adminSettings.sessionTimeout}
                  onChange={handleAdminChange}
                  className="form-input"
                  min="5"
                  max="1440"
                />
              </div>

              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={adminSettings.maxLoginAttempts}
                  onChange={handleAdminChange}
                  className="form-input"
                  min="3"
                  max="10"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-save">
                <FaSave />
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* System Info - Only for Admin */}
        {isAdmin && (
          <div className="settings-card">
            <div className="card-header">
              <FaDatabase className="card-icon" />
              <h3>System Information</h3>
            </div>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Version</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Database Status</span>
                <span className="info-value status-active">Connected</span>
              </div>
              <div className="info-item">
                <span className="info-label">Server Status</span>
                <span className="info-value status-active">Running</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Backup</span>
                <span className="info-value">2 hours ago</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
