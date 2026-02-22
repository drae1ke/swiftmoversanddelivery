import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function UserModal({ userModal, setUserModal, saveUser, toast }) {
  if (!userModal.open) return null;

  return (
    <div className={`ap-mo ${userModal.open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setUserModal(m => ({ ...m, open: false }))}>
      <div className="ap-modal-lg">
        <div className="ap-modal-hdr">
          <div className="ap-modal-htitle">{userModal.mode === 'add' ? 'Add User' : 'Edit User'}</div>
          <button className="ap-panel-close" onClick={() => setUserModal(m => ({ ...m, open: false }))}>
            <FaTimes />
          </button>
        </div>
        <div className="ap-fg">
          <div className="ap-frow">
            <div className="ap-field">
              <label>Full Name</label>
              <input 
                placeholder="e.g. Jane Omondi" 
                value={userModal.data.name || ''} 
                onChange={e => setUserModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }))} 
              />
            </div>
            <div className="ap-field">
              <label>Phone</label>
              <input 
                placeholder="+254 7XX XXX XXX" 
                value={userModal.data.phone || ''} 
                onChange={e => setUserModal(m => ({ ...m, data: { ...m.data, phone: e.target.value } }))} 
              />
            </div>
          </div>
          <div className="ap-field">
            <label>Email</label>
            <input 
              placeholder="user@example.com" 
              value={userModal.data.email || ''} 
              onChange={e => setUserModal(m => ({ ...m, data: { ...m.data, email: e.target.value } }))} 
            />
          </div>
          <div className="ap-frow">
            <div className="ap-field">
              <label>Role</label>
              <select 
                value={userModal.data.role || 'owner'} 
                onChange={e => setUserModal(m => ({ ...m, data: { ...m.data, role: e.target.value } }))}
              >
                <option value="owner">Owner</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="ap-field">
              <label>Status</label>
              <select 
                value={userModal.data.status || 'active'} 
                onChange={e => setUserModal(m => ({ ...m, data: { ...m.data, status: e.target.value } }))}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
        <div className="ap-form-footer">
          <button className="ap-btn ap-btn-outline" onClick={() => setUserModal(m => ({ ...m, open: false }))}>
            Cancel
          </button>
          <button 
            className="ap-btn ap-btn-primary" 
            onClick={() => {
              if (!userModal.data.name || !userModal.data.email) {
                return toast('Name and email required', 'error');
              }
              saveUser(userModal.data);
            }}
          >
            {userModal.mode === 'add' ? 'Add User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}