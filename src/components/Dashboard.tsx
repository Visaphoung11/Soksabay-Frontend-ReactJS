import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loader">Loading your space...</div>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] || "User";

  return (
    <div className="dashboard-page">
      <div className="dashboard-card animate-in">
        {/* Header / Welcome */}
        <div className="welcome-header">
          <div className="avatar-glow">
            <div className="avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {displayName}!</h1>
            <p>Here's your account overview</p>
          </div>
        </div>

        {/* Main Info */}
        <div className="info-grid">
          <div className="info-card">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email || "—"}</span>
          </div>

          <div className="info-card">
            <span className="info-label">Roles</span>
            <span className="info-value roles">
              {user?.roles?.join(" • ") || "No roles assigned"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <button className="logout-btn" onClick={logout}>
          <span>Sign Out</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9" />
          </svg>
        </button>

        {/* Debug toggle */}
        <div className="debug-toggle">
          <button
            className="debug-btn"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide" : "Show"} Debug Info
          </button>

          {showDebug && user && (
            <div className="debug-panel animate-in">
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
