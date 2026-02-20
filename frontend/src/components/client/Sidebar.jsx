import React from 'react';
import {FaUserAlt,FaBusAlt,FaBus,FaHome,FaShuttleVan ,FaSearchLocation} from 'react-icons/fa';

const Sidebar = ({ currentPage, onShowPage, onLogout, sidebarOpen }) => {
        const navItems = [
            { section: 'Services' },
            { id: 'services',
                icon: FaBusAlt,
                label: 'My Services' },
            { id: 'delivery', 
            icon: FaShuttleVan,
            label: 'Delivery Request' },
            { id: 'relocation',
                icon: FaBusAlt,
                label: 'Relocation' },
            { id: 'cargo', icon: FaBus,
            label: 'Cargo Transport' },
            { id: 'storage',
            icon: FaHome,
            label: 'Storage Spaces',
            badge: '0' },
            { id: 'tracking',
            icon: FaSearchLocation,
            label: 'Track Shipment' },
            { section: 'Account' },
            { id: 'profile',
                icon: FaUserAlt,
            label: 'My Profile' },
        ];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">Swift<span>Deliver</span></div>
        <div className="logo-sub">Client Portal</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div key={`section-${index}`} className="nav-section-label">
                {item.section}
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onShowPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip" onClick={() => onShowPage('profile')}>
          <div className="user-avatar">JM</div>
          <div>
            <div className="user-name">James Mwangi</div>
            <div className="user-role">Client Account</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <span>⎋</span> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;