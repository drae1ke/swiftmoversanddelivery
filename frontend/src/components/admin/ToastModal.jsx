import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function Toast({ toasts }) {
  return (
    <div className="ap-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`ap-toast ${t.type}`}>
          {t.type === 'success' ? <FaCheck /> : <FaTimes />} {t.msg}
        </div>
      ))}
    </div>
  );
}