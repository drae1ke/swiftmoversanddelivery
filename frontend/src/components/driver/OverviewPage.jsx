import React from 'react';
import { FaTruck, FaClock, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';

export default function OverviewPage({ 
  active, trips, activeTrip, pendingTrips, completedTrips, totalEarnings, 
  setPage, setPanel, SCHEDULE 
}) {
  if (!active) return null;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FaTruck />;
      case 'pending': return <FaClock />;
      case 'completed': return <FaCheckCircle />;
      case 'cancelled': return '❌';
      default: return null;
    }
  };

  const getIconClass = (status) => {
    if (status === 'active') return 'active-bg';
    if (status === 'pending') return 'pending-bg';
    return 'done-bg';
  };

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Good morning</div>
        <h1 className="dp-page-title">Driver <span>Dashboard</span></h1>
        <p className="dp-page-desc">Your active trips, today's schedule, and earnings at a glance.</p>
      </div>
      <div className="dp-stats">
        <div className="dp-stat">
          <div className="dp-stat-lbl">Active Trip</div>
          <div className={`dp-stat-val ${activeTrip ? 'green' : 'red'}`}>{activeTrip ? '1' : '0'}</div>
          <div className="dp-stat-sub">{activeTrip ? activeTrip.tripId : 'No active trip'}</div>
        </div>
        <div className="dp-stat">
          <div className="dp-stat-lbl">Pending</div>
          <div className="dp-stat-val amber">{pendingTrips}</div>
          <div className="dp-stat-sub">awaiting dispatch</div>
        </div>
        <div className="dp-stat">
          <div className="dp-stat-lbl">Completed</div>
          <div className="dp-stat-val">{completedTrips.length}</div>
          <div className="dp-stat-sub">this week</div>
        </div>
        <div className="dp-stat">
          <div className="dp-stat-lbl">Earnings</div>
          <div className="dp-stat-val" style={{ fontSize: '1.4rem' }}>
            KES {(totalEarnings / 1000).toFixed(1)}K
          </div>
          <div className="dp-stat-sub">total completed</div>
        </div>
      </div>
      <div className="dp-ov-grid">
        <div className="dp-card dp-card-pad">
          <div className="dp-sec-header">
            <div className="dp-sec-title">Recent Trips</div>
            <button className="dp-btn dp-btn-outline dp-btn-sm" onClick={() => setPage('trips')}>
              View All →
            </button>
          </div>
          <div className="dp-trip-list">
            {trips.slice(0, 4).map(t => (
              <div key={t.id} className="dp-trip-card" onClick={() => setPanel({ open: true, trip: t })}>
                <div className="dp-trip-head">
                  <div className={`dp-trip-icon ${getIconClass(t.status)}`}>
                    {getStatusIcon(t.status)}
                  </div>
                  <div>
                    <div className="dp-trip-id">{t.tripId}</div>
                    <div className="dp-trip-meta">{t.customer} · {t.date}</div>
                  </div>
                  <div className="dp-trip-status">
                    <span className={`dp-pill dp-pill-${t.status}`}>{t.status}</span>
                  </div>
                </div>
                <div className="dp-trip-route">
                  <div className="dp-route-row">
                    <div className="dp-route-dot from" />
                    <span className="dp-route-label">From</span>
                    <span className="dp-route-val">{t.from}</span>
                  </div>
                  <div className="dp-route-line" style={{ marginLeft: 3.5 }} />
                  <div className="dp-route-row">
                    <div className="dp-route-dot to" />
                    <span className="dp-route-label">To</span>
                    <span className="dp-route-val">{t.to}</span>
                  </div>
                </div>
                <div className="dp-trip-foot">
                  <span className="dp-trip-amount">KES {t.amount.toLocaleString()}</span>
                  <span className="dp-trip-time">
                    <FaClock size={12} /> {t.time} · {t.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dp-card dp-card-pad">
          <div className="dp-sec-header">
            <div className="dp-sec-title">Today's Schedule</div>
          </div>
          <div className="dp-sched-list">
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
      </div>
    </div>
  );
}