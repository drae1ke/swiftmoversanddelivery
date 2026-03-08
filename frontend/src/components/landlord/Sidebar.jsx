import React from 'react';
import {
  FaChartPie, FaBuilding, FaUser, FaSignOutAlt
} from 'react-icons/fa';
import { getInitials } from '../../utils/utils';

export default function Sidebar({ page, setPage, profile, setLogoutModal, props, availableCount, unavailableCount }) {
  const navItems = [
    { section: 'Portfolio' },
    { id: 'overview', icon: FaChartPie, label: 'Overview' },
    {
      id: 'properties',
      icon: FaBuilding,
      label: 'My Properties',
      badge: props.length > 0 ? props.length : null,
    },
    { section: 'Account' },
    { id: 'profile', icon: FaUser, label: 'My Profile' },
  ];

  return (
    <aside className="op-sidebar">
      <div className="op-logo">
        <div className="op-logo-mark">Vault<span>Space</span></div>
        <div className="op-logo-sub">Owner Portal</div>
      </div>

      <nav className="op-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="op-nav-section">{item.section}</div>;
          }
          return (
            <button
              key={item.id}
              className={`op-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="op-nav-icon"><item.icon size={14} /></span>
              {item.label}
              {item.badge != null && (
                <span className="op-nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick stats */}
      {props.length > 0 && (
        <div className="op-sidebar-stats">
          <div className="op-ss-row">
            <span className="op-ss-dot op-ss-green" />
            <span className="op-ss-label">Available</span>
            <span className="op-ss-val">{availableCount}</span>
          </div>
          <div className="op-ss-row">
            <span className="op-ss-dot op-ss-red" />
            <span className="op-ss-label">Unavailable</span>
            <span className="op-ss-val">{unavailableCount}</span>
          </div>
        </div>
      )}

      <div className="op-footer">
        <div className="op-user-chip" onClick={() => setPage('profile')}>
          <div className="op-avatar">{getInitials(profile.name)}</div>
          <div>
            <div className="op-uname">{profile.name || 'Property Owner'}</div>
            <div className="op-urole">Storage Owner</div>
          </div>
        </div>
        <button className="op-logout" onClick={() => setLogoutModal(true)}>
          <FaSignOutAlt size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}