import React from 'react';
import { mkInitials } from '../../utils/utils';

export default function OverviewPage({ 
  active, users, trips, props, totalRevenue, 
  activeUsers, pendingUsers, setPage, setPanel 
}) {
  if (!active) return null;

  const ALERTS = [
    { type: 'critical', title: 'Grace Njeri account suspended', time: '1h ago' },
    { type: 'warning', title: 'Amina Hassan pending verification', time: '3h ago' },
    { type: 'warning', title: 'Thika Road Mini-Storage has 0% occupancy', time: 'Yesterday' },
    { type: 'info', title: 'System backup completed', time: '2 days ago' },
  ];

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">System Overview</div>
        <h1 className="ap-page-title">Admin <span>Dashboard</span></h1>
        <p className="ap-page-desc">Platform-wide stats, alerts, and recent activity across all users.</p>
      </div>
      <div className="ap-stats">
        <div className="ap-stat">
          <div className="ap-stat-lbl">Total Users</div>
          <div className="ap-stat-val">{users.length}</div>
          <div className="ap-stat-sub">{activeUsers} active · {pendingUsers} pending</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat-lbl">Active Trips</div>
          <div className="ap-stat-val green">{trips.filter(t => t.status === 'active').length}</div>
          <div className="ap-stat-sub">in progress now</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat-lbl">Properties</div>
          <div className="ap-stat-val blue">{props.length}</div>
          <div className="ap-stat-sub">{props.reduce((a, p) => a + p.units, 0)} total units</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat-lbl">Platform Revenue</div>
          <div className="ap-stat-val" style={{ fontSize: '1.4rem' }}>
            KES {(totalRevenue / 1000).toFixed(0)}K
          </div>
          <div className="ap-stat-sub">monthly across all props</div>
        </div>
      </div>
      <div className="ap-ov-grid">
        <div className="ap-card ap-card-pad">
          <div className="ap-sec-header">
            <div className="ap-sec-title">Recent Users</div>
            <button className="ap-btn ap-btn-outline ap-btn-sm" onClick={() => setPage('users')}>
              View All →
            </button>
          </div>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(u => (
                  <tr key={u.id} onClick={() => setPanel({ open: true, type: 'user', data: u })}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="ap-user-av">{mkInitials(u.name)}</div>
                        <div>
                          <div className="ap-td-name">{u.name}</div>
                          <div className="ap-td-sub">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`ap-pill ap-pill-${u.role}`}>{u.role}</span></td>
                    <td><span className={`ap-pill ap-pill-${u.status}`}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="ap-card ap-card-pad">
          <div className="ap-sec-header">
            <div className="ap-sec-title">System Alerts</div>
          </div>
          <div className="ap-activity">
            {ALERTS.map((a, i) => (
              <div key={i} className="ap-act-item">
                <div className={`ap-act-dot ${a.type === 'critical' ? 'r' : a.type === 'warning' ? 'a' : 'b'}`} />
                <div>
                  <div className="ap-act-text"><strong>{a.title}</strong></div>
                  <div className="ap-act-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}