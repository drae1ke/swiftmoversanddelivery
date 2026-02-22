import React from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';

export default function ConfirmModal({ confirm, setConfirm }) {
  if (!confirm.open) return null;

  return (
    <div className={`op-mo ${confirm.open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setConfirm(c => ({ ...c, open: false }))}>
      <div className="op-modal-sm">
        <div className="op-modal-icon">{confirm.icon}</div>
        <div className="op-modal-title">{confirm.title}</div>
        <div className="op-modal-desc">{confirm.desc}</div>
        <div className="op-modal-acts">
          <button className="op-btn op-btn-outline" onClick={() => setConfirm(c => ({ ...c, open: false }))}>
            <FaTimes /> Cancel
          </button>
          <button className="op-btn op-btn-danger" onClick={confirm.onOk}>
            <FaCheck /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
}