import React from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function ProfilePage({ 
  active, profile, editProf, setEditProf, editForm, setEditForm,
  saveProfile, completedTrips, pendingTrips, totalEarnings, docs, toast 
}) {
  if (!active) return null;

  const validDocs = docs.filter(d => d.status === 'valid').length;

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">My Account</div>
        <h1 className="dp-page-title">Driver <span>Profile</span></h1>
        <p className="dp-page-desc">Manage your personal and vehicle details.</p>
      </div>
      <div className="dp-prof-layout">
        <div className="dp-prof-card">
          <div className="dp-prof-av">DO</div>
          <div className="dp-prof-name">{profile.name}</div>
          <div className="dp-prof-email">{profile.email}</div>
          <div className="dp-prof-stats">
            <div className="dp-ps">
              <div className="dp-ps-v">{completedTrips.length}</div>
              <div className="dp-ps-l">Trips</div>
            </div>
            <div className="dp-ps">
              <div className="dp-ps-v">{pendingTrips}</div>
              <div className="dp-ps-l">Pending</div>
            </div>
            <div className="dp-ps">
              <div className="dp-ps-v" style={{ fontSize: '.9rem' }}>{(totalEarnings / 1000).toFixed(0)}K</div>
              <div className="dp-ps-l">Earned</div>
            </div>
            <div className="dp-ps">
              <div className="dp-ps-v">{validDocs}</div>
              <div className="dp-ps-l">Valid Docs</div>
            </div>
          </div>
          <button 
            className="dp-btn dp-btn-outline" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '.82rem' }}
            onClick={() => { 
              setEditProf(!editProf); 
              setEditForm({ ...profile }); 
            }}
          >
            <FaEdit /> {editProf ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        <div className="dp-prof-content">
          <div className="dp-info-card">
            <div className="dp-ic-hdr">
              <div className="dp-ic-title">Personal Information</div>
              {!editProf && (
                <button className="dp-ic-edit" onClick={() => setEditProf(true)}>
                  <FaEdit /> Edit
                </button>
              )}
            </div>
            {!editProf ? (
              <div className="dp-info-grid">
                {[
                  ['Full Name', profile.name],
                  ['Phone', profile.phone],
                  ['Email', profile.email],
                  ['Licence No.', profile.licence],
                  ['Vehicle', profile.vehicle],
                  ['County', profile.county]
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="dp-if-l">{l}</div>
                    <div className="dp-if-v">{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="dp-fg">
                  <div className="dp-frow">
                    <div className="dp-field">
                      <label>Full Name</label>
                      <input 
                        value={editForm.name} 
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                      />
                    </div>
                    <div className="dp-field">
                      <label>Phone</label>
                      <input 
                        value={editForm.phone} 
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="dp-frow">
                    <div className="dp-field">
                      <label>Email</label>
                      <input 
                        value={editForm.email} 
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                      />
                    </div>
                    <div className="dp-field">
                      <label>Vehicle</label>
                      <input 
                        value={editForm.vehicle} 
                        onChange={e => setEditForm({ ...editForm, vehicle: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
                <div className="dp-form-footer">
                  <button className="dp-btn dp-btn-outline" onClick={() => setEditProf(false)}>
                    <FaTimes /> Cancel
                  </button>
                  <button className="dp-btn dp-btn-primary" onClick={() => saveProfile()}>
                    <FaSave /> Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="dp-dz">
            <div className="dp-dz-title">Danger Zone</div>
            <div className="dp-dz-row">
              <div className="dp-dz-desc">Deactivate your driver account. Contact your fleet manager to reactivate.</div>
              <button className="dp-btn dp-btn-danger dp-btn-sm" onClick={() => toast('Contact your fleet manager to deactivate.', 'error')}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}