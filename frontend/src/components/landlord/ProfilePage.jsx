import React from 'react';
import { FaEdit, FaSave, FaTimes, FaWarehouse } from 'react-icons/fa';
import { COUNTIES } from '../../utils/utils';

export default function ProfilePage({
  active,
  profile,
  editProf,
  setEditProf,
  editProfForm,
  setEditProfForm,
  saveProfile,
  props,
  totalRevenue,
  toast,
}) {
  if (!active) return null;

  const setField = (key, value) =>
    setEditProfForm(f => ({ ...f, [key]: value }));

  const available = props.filter(p => p.availability === 'available').length;
  const reserved = props.filter(p => p.availability === 'reserved').length;
  const unavailable = props.filter(p => p.availability === 'unavailable').length;
  const pending = props.filter(p => p.status === 'pending').length;

  return (
    <div className="op-page active">
      <div className="op-page-hdr">
        <div>
          <div className="op-page-tag">Account</div>
          <h1 className="op-page-title">My Profile</h1>
          <p className="op-page-desc">Manage your personal details and view your portfolio summary.</p>
        </div>
      </div>

      <div className="op-profile-grid">
        {/* Profile Card */}
        <div className="op-info-card">
          <div className="op-ic-hdr">
            <div className="op-ic-title">Personal Information</div>
            {!editProf && (
              <button className="op-btn op-btn-xs op-btn-outline" onClick={() => setEditProf(true)}>
                <FaEdit size={11} /> Edit
              </button>
            )}
          </div>

          {!editProf ? (
            <div className="op-info-grid">
              {[
                ['Full Name', profile.name],
                ['Email', profile.email],
                ['Phone', profile.phone || '—'],
                ['County', profile.county || '—'],
                ['ID Number', profile.idNumber || '—'],
              ].map(([l, v]) => (
                <div key={l} className="op-info-field">
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
                      onChange={e => setField('name', e.target.value)}
                    />
                  </div>
                  <div className="op-field">
                    <label>Phone</label>
                    <input
                      value={editProfForm.phone}
                      onChange={e => setField('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="op-frow">
                  <div className="op-field">
                    <label>County</label>
                    <select
                      value={editProfForm.county}
                      onChange={e => setField('county', e.target.value)}
                    >
                      <option value="">Select county</option>
                      {COUNTIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="op-field">
                    <label>ID Number</label>
                    <input
                      value={editProfForm.idNumber}
                      onChange={e => setField('idNumber', e.target.value)}
                    />
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

        {/* Portfolio Summary */}
        <div className="op-info-card">
          <div className="op-ic-hdr">
            <div className="op-ic-title">Portfolio Summary</div>
          </div>
          <div className="op-info-grid">
            {[
              ['Total Properties', props.length],
              ['Available', available],
              ['Reserved', reserved],
              ['Unavailable', unavailable],
              ['Pending Approval', pending],
              ['Est. Monthly Revenue', `KES ${Number(totalRevenue).toLocaleString()}`],
            ].map(([l, v]) => (
              <div key={l} className="op-info-field">
                <div className="op-if-l">{l}</div>
                <div className="op-if-v">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="op-dz">
          <div className="op-dz-title">Danger Zone</div>
          <div className="op-dz-row">
            <div className="op-dz-desc">
              Permanently delete your account and all associated storage listings. This cannot be undone.
            </div>
            <button
              className="op-btn op-btn-danger op-btn-sm"
              onClick={() => toast('Account deletion requires contacting support.', 'error')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}