import React from 'react';
import {
  FaChartPie, FaUsers, FaTruck, FaBuilding,
  FaExclamationTriangle, FaCog, FaUser, FaSignOutAlt,
  FaMapMarkedAlt, FaBoxOpen
} from 'react-icons/fa';

export default function Sidebar({ page, setPage, adminProfile, setLogoutModal, pendingUsers, activeTrips, criticalAlerts }) {
  const navItems = [
    { section: 'Management' },
    { id: 'overview', icon: FaChartPie, label: 'Overview' },
    { id: 'users', icon: FaUsers, label: 'Users' },
    { id: 'orders', icon: FaBoxOpen, label: 'Orders' },       // ← new
    { id: 'trips', icon: FaTruck, label: 'Trips' },
    { id: 'properties', icon: FaBuilding, label: 'Properties' },
    { id: 'driversmap', icon: FaMapMarkedAlt, label: 'Drivers Map' },
    { section: 'System' },
    { id: 'alerts', icon: FaExclamationTriangle, label: 'Alerts' },
    { id: 'settings', icon: FaCog, label: 'Settings' },
    { section: 'Account' },
    { id: 'profile', icon: FaUser, label: 'Admin Profile' },
  ];

  const getBadge = (id) => {
    if (id === 'users' && pendingUsers > 0) return { count: pendingUsers, color: 'amber' };
    if (id === 'trips' && activeTrips > 0) return { count: activeTrips, color: 'green' };
    if (id === 'alerts' && criticalAlerts > 0) return { count: criticalAlerts, color: 'red' };
    return null;
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  return (
    <aside className="ap-sidebar">
      <div className="ap-logo">
        <div className="ap-logo-mark">Swift<span>Deliver</span></div>
        <div className="ap-logo-sub">Admin Console</div>
      </div>
      <nav className="ap-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="ap-nav-section">{item.section}</div>;
          }
          const badge = getBadge(item.id);
          return (
            <button
              key={item.id}
              className={`ap-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="ap-nav-icon"><item.icon size={14} /></span>
              {item.label}
              {badge && <span className={`ap-nav-badge ${badge.color}`}>{badge.count}</span>}
            </button>
          );
        })}
      </nav>
      <div className="ap-footer">
        <div className="ap-user-chip" onClick={() => setPage('profile')}>
          <div className="ap-avatar">{getInitials(adminProfile.name)}</div>
          <div>
            <div className="ap-uname">{adminProfile.name}</div>
            <div className="ap-urole">Admin</div>
          </div>
        </div>
        <button className="ap-logout" onClick={() => setLogoutModal(true)}>
          <FaSignOutAlt size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}