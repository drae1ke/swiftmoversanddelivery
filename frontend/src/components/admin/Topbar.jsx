import React from 'react';
import { FaBell } from 'react-icons/fa';

export default function Topbar({ page, pageLabels = {} }) {
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
    <header className="ap-topbar">
      <span className="ap-topbar-title">{pageLabels[page] || page}</span>
      <span className="ap-topbar-sub">{formatDate()}</span>
      <button className="ap-notif">
        <FaBell size={16} />
        <span className="ap-notif-dot" />
      </button>
    </header>
  );
}