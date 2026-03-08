import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

export default function LogoutModal({ logoutModal, setLogoutModal, onConfirm }) {
  return (
    <div className={`ap-mo ${logoutModal ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setLogoutModal(false)}>
      <div className="ap-modal-sm">
        <div className="ap-modal-icon"><FaSignOutAlt size={32} /></div>
        <div className="ap-modal-title">Log Out?</div>
        <div className="ap-modal-desc">You'll need to sign in again to access the admin console.</div>
        <div className="ap-modal-acts">
          <button className="ap-btn ap-btn-outline" onClick={() => setLogoutModal(false)}>
            Cancel
          </button>
          <button className="ap-btn ap-btn-primary" onClick={() => {
            setLogoutModal(false);
            onConfirm?.();
          }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}