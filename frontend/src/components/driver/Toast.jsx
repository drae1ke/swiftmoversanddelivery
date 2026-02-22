import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function Toast({ toasts }) {
  return (
    <div className="dp-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`dp-toast ${t.type}`}>
          {t.type === 'success' ? <FaCheck /> : <FaTimes />} {t.msg}
        </div>
      ))}
    </div>
  );
}