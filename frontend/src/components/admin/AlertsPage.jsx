import React from 'react';

export default function AlertsPage({ active, ALERTS }) {
  if (!active) return null;

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">System</div>
        <h1 className="ap-page-title">System <span>Alerts</span></h1>
        <p className="ap-page-desc">Critical issues, warnings, and platform notifications.</p>
      </div>
      <div className="ap-alert-list">
        {ALERTS.map((a, i) => (
          <div key={i} className={`ap-alert-row ${a.type}`}>
            <div className="ap-alert-icon">{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="ap-alert-title">{a.title}</div>
              <div className="ap-alert-desc">{a.desc}</div>
            </div>
            <div className="ap-alert-time">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}