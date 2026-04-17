import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import "./SettingsPage.css";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-top">
          <Link className="settings-back" to="/dashboard">
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">
          We’ll build this soon to let you update your profile info.
        </p>

        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Username</span>
            <span className="settings-value">{user?.username || "—"}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Email</span>
            <span className="settings-value">{user?.email || "—"}</span>
          </div>

          <div className="settings-note">
            Coming next: edit username/email, change password, and delete
            account.
          </div>
        </div>
      </div>
    </div>
  );
}
