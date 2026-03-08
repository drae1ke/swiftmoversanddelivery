import React from 'react';
import {
  FaChartPie, FaTruck, FaCalendarAlt, FaMoneyBillWave,
  FaFileAlt, FaUser, FaSignOutAlt, FaHome,
} from 'react-icons/fa';
import { getInitials } from '../../utils/utils';

export default function Sidebar({
  page, setPage, profile, setLogoutModal,
  pendingTrips, expiringDocs, isOnline, availableRelocCount,
}) {
  const navItems = [
    { section: 'Operations' },
    { id: 'overview',     icon: FaChartPie,      label: 'Overview' },
    { id: 'trips',        icon: FaTruck,         label: 'My Trips',             badge: pendingTrips > 0 ? pendingTrips : null, bc: 'amber' },
    {
      id: 'relocations',
      icon: FaHome,
      label: 'Relocations',
      badge: availableRelocCount > 0 ? availableRelocCount : null,
      bc: 'red',
      desc: 'Available jobs',
    },
    { id: 'schedule',     icon: FaCalendarAlt,   label: 'Schedule' },
    { id: 'earnings',     icon: FaMoneyBillWave, label: 'Earnings' },
    { section: 'Account' },
    { id: 'documents',    icon: FaFileAlt,       label: 'Documents',            badge: expiringDocs > 0 ? '!' : null, bc: 'amber' },
    { id: 'profile',      icon: FaUser,          label: 'My Profile' },
  ];

  return (
    <aside className="dp-sidebar">
      <div className="dp-logo">
        <div className="dp-logo-mark">Swift<span>Deliver</span></div>
        <div className="dp-logo-sub">Driver Portal</div>
      </div>

      <nav className="dp-nav">
        {navItems.map((item, i) => {
          if (item.section) return <div key={i} className="dp-nav-section">{item.section}</div>;
          return (
            <button
              key={item.id}
              className={`dp-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="dp-nav-icon"><item.icon size={14} /></span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge != null && (
                <span className={`dp-nav-badge ${item.bc || ''}`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="dp-footer">
        <div className="dp-user-chip" onClick={() => setPage('profile')}>
          <div className="dp-avatar" style={{ position: 'relative' }}>
            {getInitials(profile.name)}
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 9, height: 9, borderRadius: '50%',
              background: isOnline ? '#22c55e' : '#94a3b8',
              border: '2px solid #fff',
            }} />
          </div>
          <div>
            <div className="dp-uname">{profile.name || 'Driver'}</div>
            <div className="dp-urole" style={{ color: isOnline ? '#15803d' : undefined }}>
              {isOnline ? '● Online' : '○ Offline'}
            </div>
          </div>
        </div>
        <button className="dp-logout" onClick={() => setLogoutModal(true)}>
          <FaSignOutAlt size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}