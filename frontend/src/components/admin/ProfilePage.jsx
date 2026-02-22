import React from 'react';
import { FaEdit } from 'react-icons/fa';

export default function ProfilePage({ 
  active, adminProfile, editProf, setEditProf, editForm, setEditForm, 
  saveProfile, toast, users, props, trips, ALERTS 
}) {
  if (!active) return null;

  const criticalAlerts = ALERTS.filter(a => a.type === 'critical').length;

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">My Account</div>
        <h1 className="ap-page-title">Admin <span>Profile</span></h1>
        <p className="ap-page-desc">Manage your administrator account details and access.</p>
      </div>
      <div className="ap-prof-layout">
        <div className="ap-prof-card">
          <div className="ap-prof-av">FA</div>
          <div className="ap-prof-name">{adminProfile.name}</div>
          <div className="ap-prof-email">{adminProfile.email}</div>
          <div className="ap-prof-stats">
            <div className="ap-ps">
              <div className="ap-ps-v">{users.length}</div>
              <div className="ap-ps-l">Users</div>
            </div>
            <div className="ap-ps">
              <div className="ap-ps-v">{props.length}</div>
              <div className="ap-ps-l">Props</div>
            </div>
            <div className="ap-ps">
              <div className="ap-ps-v">{trips.length}</div>
              <div className="ap-ps-l">Trips</div>
            </div>
            <div className="ap-ps">
              <div className="ap-ps-v">{criticalAlerts}</div>
              <div className="ap-ps-l">Alerts</div>
            </div>
          </div>
          <button 
            className="ap-btn ap-btn-outline" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '.82rem' }}
            onClick={() => {
              setEditProf(!editProf);
              setEditForm({ ...adminProfile });
            }}
          >
            <FaEdit /> {editProf ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        <div className="ap-prof-content">
          <div className="ap-info-card">
            <div className="ap-ic-hdr">
              <div className="ap-ic-title">Account Information</div>
              {!editProf && (
                <button className="ap-ic-edit" onClick={() => setEditProf(true)}>
                  <FaEdit /> Edit
                </button>
              )}
            </div>
            {!editProf ? (
              <div className="ap-info-grid">
                {[
                  ['Full Name', adminProfile.name],
                  ['Phone', adminProfile.phone],
                  ['Email', adminProfile.email],
                  ['Role', adminProfile.role],
                  ['Access Level', adminProfile.access],
                  ['Last Login', 'Today, 08:14 AM']
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="ap-if-l">{l}</div>
                    <div className="ap-if-v">{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="ap-fg">
                  <div className="ap-frow">
                    <div className="ap-field">
                      <label>Full Name</label>
                      <input 
                        value={editForm.name} 
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                      />
                    </div>
                    <div className="ap-field">
                      <label>Phone</label>
                      <input 
                        value={editForm.phone} 
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="ap-field">
                    <label>Email</label>
                    <input 
                      value={editForm.email} 
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="ap-form-footer">
                  <button className="ap-btn ap-btn-outline" onClick={() => setEditProf(false)}>
                    Cancel
                  </button>
                  <button className="ap-btn ap-btn-primary" onClick={saveProfile}>
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="ap-dz">
            <div className="ap-dz-title">Admin Danger Zone</div>
            <div className="ap-dz-row">
              <div className="ap-dz-desc">
                Revoke your admin privileges. Another admin must restore access. This takes effect immediately.
              </div>
              <button 
                className="ap-btn ap-btn-danger ap-btn-sm" 
                onClick={() => toast('Revocation requires approval from another admin.', 'error')}
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}