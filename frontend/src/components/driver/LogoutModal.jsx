import React from 'react';
import { FaSignOutAlt, FaTimes, FaCheck } from 'react-icons/fa';

export default function LogoutModal({ logoutModal, setLogoutModal, toast }) {
  return (
    <div className={`dp-mo ${logoutModal ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setLogoutModal(false)}>
      <div className="dp-modal">
        <div className="dp-modal-icon"><FaSignOutAlt size={32} /></div>
        <div className="dp-modal-title">Log Out?</div>
        <div className="dp-modal-desc">You'll need to sign in again to access your portal.</div>
        <div className="dp-modal-acts">
          <button className="dp-btn dp-btn-outline" onClick={() => setLogoutModal(false)}>
            <FaTimes /> Cancel
          </button>
          <button className="dp-btn dp-btn-primary" onClick={() => {
            setLogoutModal(false);
            toast('Logged out');
          }}>
            <FaCheck /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}