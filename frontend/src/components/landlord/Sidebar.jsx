import React from 'react';
import { 
  FaChartPie, FaBuilding, FaBox, FaFileAlt, 
  FaMoneyBillWave, FaUser, FaSignOutAlt 
} from 'react-icons/fa';
import { getInitials } from '../../utils/utils';

export default function Sidebar({ page, setPage, profile, setLogoutModal, props, vacantUnits, overduePayments }) {
  const navItems = [
    { section: 'Portfolio' },
    { id: 'overview', icon: FaChartPie, label: 'Overview' },
    { id: 'properties', icon: FaBuilding, label: 'Properties', badge: props.length },
    { id: 'units', icon: FaBox, label: 'All Units', badge: `${vacantUnits} vacant`, bc: vacantUnits > 0 ? '' : 'green' },
    { id: 'leases', icon: FaFileAlt, label: 'Leases' },
    { id: 'payments', icon: FaMoneyBillWave, label: 'Payments', badge: overduePayments || null, bc: 'amber' },
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
                <span className={`op-nav-badge ${item.bc || ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="op-footer">
        <div className="op-user-chip" onClick={() => setPage('profile')}>
          <div className="op-avatar">{getInitials(profile.name)}</div>
          <div>
            <div className="op-uname">{profile.name}</div>
            <div className="op-urole">Property Owner</div>
          </div>
        </div>
        <button className="op-logout" onClick={() => setLogoutModal(true)}>
          <FaSignOutAlt size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}