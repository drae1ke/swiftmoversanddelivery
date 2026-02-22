import React from 'react';
import { 
  FaChartPie, FaTruck, FaCalendarAlt, FaMoneyBillWave, 
  FaFileAlt, FaUser, FaSignOutAlt, FaExclamationTriangle 
} from 'react-icons/fa';
import { getInitials } from '../../utils/utils';

export default function Sidebar({ page, setPage, profile, setLogoutModal, pendingTrips, expiringDocs }) {
  const navItems = [
    { section: 'Operations' },
    { id: 'overview', icon: FaChartPie, label: 'Overview' },
    { id: 'trips', icon: FaTruck, label: 'My Trips', badge: pendingTrips > 0 ? pendingTrips : null, bc: 'amber' },
    { id: 'schedule', icon: FaCalendarAlt, label: 'Schedule' },
    { id: 'earnings', icon: FaMoneyBillWave, label: 'Earnings' },
    { section: 'Account' },
    { id: 'documents', icon: FaFileAlt, label: 'Documents', badge: expiringDocs > 0 ? '!' : null, bc: 'amber' },
    { id: 'profile', icon: FaUser, label: 'My Profile' },
  ];

  return (
    <aside className="dp-sidebar">
      <div className="dp-logo">
        <div className="dp-logo-mark">Vault<span>Space</span></div>
        <div className="dp-logo-sub">Driver Portal</div>
      </div>
      <nav className="dp-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="dp-nav-section">{item.section}</div>;
          }
          return (
            <button
              key={item.id}
              className={`dp-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="dp-nav-icon"><item.icon size={14} /></span>
              {item.label}
              {item.badge != null && (
                <span className={`dp-nav-badge ${item.bc || ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="dp-footer">
        <div className="dp-user-chip" onClick={() => setPage('profile')}>
          <div className="dp-avatar">{getInitials(profile.name)}</div>
          <div>
            <div className="dp-uname">{profile.name}</div>
            <div className="dp-urole">Driver</div>
          </div>
        </div>
        <button className="dp-logout" onClick={() => setLogoutModal(true)}>
          <FaSignOutAlt size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}