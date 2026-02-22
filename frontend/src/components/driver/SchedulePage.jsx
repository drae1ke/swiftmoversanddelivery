import React from 'react';

export default function SchedulePage({ active, SCHEDULE }) {
  if (!active) return null;

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Today</div>
        <h1 className="dp-page-title">My <span>Schedule</span></h1>
        <p className="dp-page-desc">Your dispatched trips and shift timeline for today.</p>
      </div>
      <div className="dp-sched-list" style={{ maxWidth: 700 }}>
        {SCHEDULE.map((s, i) => (
          <div key={i} className="dp-sched-item">
            <div className="dp-sched-time-col">
              <div className="dp-sched-time">{s.time}</div>
              <div className="dp-sched-ampm">{s.ampm}</div>
            </div>
            <div className="dp-sched-dot-col">
              <div className={`dp-sched-dot ${s.filled ? 'filled' : ''}`} />
            </div>
            <div className="dp-sched-info">
              <div className="dp-sched-title">{s.title}</div>
              <div className="dp-sched-detail">{s.detail}</div>
            </div>
            {s.pill && (
              <div className="dp-sched-badge">
                <span className={`dp-pill ${s.pill.cls}`}>{s.pill.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}