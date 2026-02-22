import React from 'react';
import { FaSignOutAlt, FaTimes, FaCheck } from 'react-icons/fa';

export default function LogoutModal({ logoutMod, setLogoutMod, toast }) {
  return (
    <div className={`op-mo ${logoutMod ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setLogoutMod(false)}>
      <div className="op-modal-sm">
        <div className="op-modal-icon"><FaSignOutAlt size={32} /></div>
        <div className="op-modal-title">Log Out?</div>
        <div className="op-modal-desc">You'll need to sign in again to access your owner portal.</div>
        <div className="op-modal-acts">
          <button className="op-btn op-btn-outline" onClick={() => setLogoutMod(false)}>
            <FaTimes /> Cancel
          </button>
          <button className="op-btn op-btn-primary" onClick={() => { setLogoutMod(false); toast('Logged out'); }}>
            <FaCheck /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}