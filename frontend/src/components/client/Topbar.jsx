import React from 'react';
import NotificationsDropdown from '../common/NotificationsDropdown';

const Topbar = ({ title, date, onToggleSidebar }) => {
  return (
    <header className="topbar">
      <button className="topbar-hamburger" onClick={onToggleSidebar}>
        ☰
      </button>
      <span className="topbar-title">{title}</span>
      <span className="topbar-subtitle">{date}</span>
      <NotificationsDropdown />
    </header>
  );
};

export default Topbar;
