import React, { useState } from "react";
import "./Dashboard.css";
import Button from "../components/UI/Button";

const Dashboard: React.FC = () => {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  if (showAdminDashboard) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="metrics-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="metric-card">
              <div className="metric-header">
                <span className="metric-label">hello 1</span>
                <div className="metric-icon">❓</div>
              </div>
              <div className="metric-value">200</div>
              <div className="metric-footer">
                <span className="metric-trend">↗ 12.00%</span>
                <span className="metric-description">
                  something less important
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-toggle">
          <Button onClick={() => setShowAdminDashboard(false)}>
            Show Welcome View
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome, Ali</h1>
      </div>

      <div className="dashboard-toggle">
        <Button onClick={() => setShowAdminDashboard(true)}>
          Show Admin Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
