import React from 'react';
import { getPillClass, formatNumber, ACTIVITY } from '../../utils/utils';

export default function OverviewPage({ 
  active, props, allUnits, totalUnits, totalOcc, totalVac, totalRev, setPage, setPanel 
}) {
  if (!active) return null;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'occupied': return '✅';
      case 'maintenance': return '🔧';
      default: return '⬜';
    }
  };

  return (
    <div className="op-page active">
      <div className="op-page-header">
        <div className="op-tag">Welcome back, Sarah</div>
        <h1 className="op-page-title">Your Storage <span>Portfolio</span></h1>
        <p className="op-page-desc">Live snapshot of all your properties, occupancy, and revenue.</p>
      </div>
      <div className="op-stats">
        <div className="op-stat">
          <div className="op-stat-lbl">Properties</div>
          <div className="op-stat-val">{props.length}</div>
          <div className="op-stat-sub">{totalUnits} total units</div>
        </div>
        <div className="op-stat">
          <div className="op-stat-lbl">Occupied</div>
          <div className="op-stat-val green">{totalOcc}</div>
          <div className="op-stat-sub">{totalUnits ? Math.round(totalOcc / totalUnits * 100) : 0}% occupancy</div>
        </div>
        <div className="op-stat">
          <div className="op-stat-lbl">Vacant</div>
          <div className="op-stat-val red">{totalVac}</div>
          <div className="op-stat-sub">available to book</div>
        </div>
        <div className="op-stat">
          <div className="op-stat-lbl">Monthly Revenue</div>
          <div className="op-stat-val" style={{ fontSize: '1.4rem' }}>
            KES {(totalRev / 1000).toFixed(0)}K
          </div>
          <div className="op-stat-sub">from occupied units</div>
        </div>
      </div>
      <div className="op-ov-grid">
        <div className="op-card op-card-pad">
          <div className="op-sec-header">
            <div className="op-sec-title">Units at a Glance</div>
            <button className="op-btn op-btn-outline op-btn-sm" onClick={() => setPage('units')}>
              View All →
            </button>
          </div>
          <div className="op-unit-list">
            {allUnits.slice(0, 6).map(u => (
              <div 
                key={u.id} 
                className="op-unit-row" 
                onClick={() => setPanel({ open: true, unitId: u.id, propId: u.propId })}
              >
                <div className="op-unit-icon">{getStatusIcon(u.status)}</div>
                <div className="op-unit-info">
                  <div className="op-unit-name">{u.unitId}</div>
                  <div className="op-unit-meta">{u.propName} · {u.size} m² · {u.type}</div>
                </div>
                <span className={`op-pill ${getPillClass(u.status)}`}>{u.status}</span>
                <div className="op-unit-price">
                  KES {formatNumber(u.price)}<br /><small>/mo</small>
                </div>
              </div>
            ))}
            {allUnits.length === 0 && (
              <div className="op-empty">No units yet. Add a property to get started.</div>
            )}
          </div>
        </div>
        <div className="op-card op-card-pad">
          <div className="op-sec-header">
            <div className="op-sec-title">Recent Activity</div>
          </div>
          <div className="op-activity">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="op-act-item">
                <div className={`op-act-dot ${a.color}`} />
                <div>
                  <div className="op-act-text">{a.text}</div>
                  <div className="op-act-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}