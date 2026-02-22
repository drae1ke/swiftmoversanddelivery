import React from 'react';

export default function ConfirmModal({ confirm, setConfirm }) {
  if (!confirm.open) return null;

  return (
    <div className={`ap-mo ${confirm.open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setConfirm(c => ({ ...c, open: false }))}>
      <div className="ap-modal-sm">
        <div className="ap-modal-icon">{confirm.icon}</div>
        <div className="ap-modal-title">{confirm.title}</div>
        <div className="ap-modal-desc">{confirm.desc}</div>
        <div className="ap-modal-acts">
          <button className="ap-btn ap-btn-outline" onClick={() => setConfirm(c => ({ ...c, open: false }))}>
            Cancel
          </button>
          <button className="ap-btn ap-btn-danger" onClick={confirm.onOk}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}