import React from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { COUNTIES, formatNumber } from '../../utils/utils';

export default function ProfilePage({ 
  active, profile, editProf, setEditProf, editProfForm, setEditProfForm,
  saveProfile, props, totalUnits, totalOcc, totalVac, totalRev, toast 
}) {
  if (!active) return null;

  return (
    <div className="op-page active">
      <div className="op-page-header">
        <div className="op-tag">My Account</div>
        <h1 className="op-page-title">Owner <span>Profile</span></h1>
        <p className="op-page-desc">Manage your personal details and account preferences.</p>
      </div>
      <div className="op-prof-layout">
        <div className="op-prof-card">
          <div className="op-prof-av">SW</div>
          <div className="op-prof-name">{profile.name}</div>
          <div className="op-prof-email">{profile.email}</div>
          <div className="op-prof-stats">
            <div className="op-ps">
              <div className="op-ps-v">{props.length}</div>
              <div className="op-ps-l">Properties</div>
            </div>
            <div className="op-ps">
              <div className="op-ps-v">{totalUnits}</div>
              <div className="op-ps-l">Units</div>
            </div>
            <div className="op-ps">
              <div className="op-ps-v">{totalOcc}</div>
              <div className="op-ps-l">Occupied</div>
            </div>
            <div className="op-ps">
              <div className="op-ps-v" style={{ fontSize: '.9rem' }}>{(totalRev / 1000).toFixed(0)}K</div>
              <div className="op-ps-l">Rev/mo</div>
            </div>
          </div>
          <button 
            className="op-btn op-btn-outline" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '.82rem' }}
            onClick={() => { 
              setEditProf(!editProf); 
              setEditProfForm({ ...profile }); 
            }}
          >
            <FaEdit /> {editProf ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        <div className="op-prof-content">
          <div className="op-info-card">
            <div className="op-ic-hdr">
              <div className="op-ic-title">Personal Information</div>
              {!editProf && (
                <button className="op-ic-edit" onClick={() => setEditProf(true)}>
                  <FaEdit /> Edit
                </button>
              )}
            </div>
            {!editProf ? (
              <div className="op-info-grid">
                {[
                  ['Full Name', profile.name],
                  ['Phone', profile.phone],
                  ['Email', profile.email],
                  ['County', profile.county],
                  ['ID Number', profile.idNumber],
                  ['Member Since', 'January 2023']
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="op-if-l">{l}</div>
                    <div className="op-if-v">{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="op-fg">
                  <div className="op-frow">
                    <div className="op-field">
                      <label>Full Name</label>
                      <input 
                        value={editProfForm.name} 
                        onChange={e => setEditProfForm({ ...editProfForm, name: e.target.value })} 
                      />
                    </div>
                    <div className="op-field">
                      <label>Phone</label>
                      <input 
                        value={editProfForm.phone} 
                        onChange={e => setEditProfForm({ ...editProfForm, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="op-frow">
                    <div className="op-field">
                      <label>Email</label>
                      <input 
                        value={editProfForm.email} 
                        onChange={e => setEditProfForm({ ...editProfForm, email: e.target.value })} 
                      />
                    </div>
                    <div className="op-field">
                      <label>County</label>
                      <select 
                        value={editProfForm.county} 
                        onChange={e => setEditProfForm({ ...editProfForm, county: e.target.value })}
                      >
                        {COUNTIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="op-form-footer">
                  <button className="op-btn op-btn-outline" onClick={() => setEditProf(false)}>
                    <FaTimes /> Cancel
                  </button>
                  <button className="op-btn op-btn-primary" onClick={saveProfile}>
                    <FaSave /> Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="op-info-card">
            <div className="op-ic-hdr">
              <div className="op-ic-title">Portfolio Summary</div>
            </div>
            <div className="op-info-grid">
              {[
                ['Properties', props.length],
                ['Total Units', totalUnits],
                ['Occupied', totalOcc],
                ['Vacant', totalVac],
                ['Occupancy', `${totalUnits ? Math.round(totalOcc / totalUnits * 100) : 0}%`],
                ['Monthly Revenue', `KES ${formatNumber(totalRev)}`]
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="op-if-l">{l}</div>
                  <div className="op-if-v">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="op-dz">
            <div className="op-dz-title">Danger Zone</div>
            <div className="op-dz-row">
              <div className="op-dz-desc">
                Permanently delete your account and all associated property data. This cannot be undone.
              </div>
              <button className="op-btn op-btn-danger op-btn-sm" onClick={() => toast('Account deletion requires contacting support.', 'error')}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}