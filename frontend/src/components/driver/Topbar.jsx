import React from 'react';
import { FaBell } from 'react-icons/fa';

export default function Topbar({ page, pageLabels }) {
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="dp-topbar">
      <span className="dp-topbar-title">{pageLabels[page]}</span>
      <span className="dp-topbar-sub">{formatDate()}</span>
      <button className="dp-notif">
        <FaBell size={16} />
        <span className="dp-notif-dot" />
      </button>
    </header>
  );
}