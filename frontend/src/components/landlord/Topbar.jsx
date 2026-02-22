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
    <header className="op-topbar">
      <span className="op-topbar-title">{pageLabels[page]}</span>
      <span className="op-topbar-sub">{formatDate()}</span>
      <button className="op-notif">
        <FaBell size={16} />
        <span className="op-notif-dot" />
      </button>
    </header>
  );
}