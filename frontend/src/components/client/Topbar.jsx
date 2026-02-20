import React from 'react';
import { FaBell } from 'react-icons/fa';

const Topbar = ({ title, date, onToggleSidebar }) => {
  return (
    <header className="topbar">
      <button className="topbar-hamburger" onClick={onToggleSidebar}>
        ☰
      </button>
      <span className="topbar-title">{title}</span>
      <span className="topbar-subtitle">{date}</span>
      <button className="topbar-notif" title="Notifications">
        <FaBell />
        <span className="notif-dot"></span>
      </button>
    </header>
  );
};

export default Topbar;