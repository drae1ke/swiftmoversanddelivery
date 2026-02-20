import React, { useState } from 'react';

const Profile = ({ isActive, onShowPage }) => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'James Mwangi',
    phone: '+254 712 345 678',
    email: 'james.mwangi@email.com',
    county: 'Nairobi',
    idNumber: '12345678'
  });

  const [editFormData, setEditFormData] = useState({ ...profileData });

  const toggleEditMode = () => {
    if (editMode) {
      // Cancel editing - revert changes
      setEditFormData({ ...profileData });
    }
    setEditMode(!editMode);
  };

  const saveProfile = () => {
    setProfileData({ ...editFormData });
    setEditMode(false);
    alert('✓ Profile saved');
  };

  const trackFromHistory = (code) => {
    onShowPage('tracking');
    // In a real app, this would set the tracking code and load the data
    setTimeout(() => {
      const event = new CustomEvent('trackShipment', { detail: { code } });
      window.dispatchEvent(event);
    }, 100);
  };

  const deliveryHistory = [
    { tracking: 'SD-2025-48271', route: 'Nairobi → Kisumu', service: 'Express Delivery', date: '15 Jan 2025', status: 'delivered' },
    { tracking: 'SD-2025-39104', route: 'Mombasa → Nairobi', service: 'Standard Delivery', date: '8 Jan 2025', status: 'delivered' },
    { tracking: 'CG-2025-33901', route: 'Nairobi → Eldoret', service: 'Cargo (3T)', date: '2 Jan 2025', status: 'transit' },
    { tracking: 'SD-2024-91822', route: 'Kisumu → Nakuru', service: 'Express Delivery', date: '28 Dec 2024', status: 'delivered' },
    { tracking: 'RL-2024-05512', route: 'Nairobi CBD → Kiambu', service: 'Relocation', date: '15 Dec 2024', status: 'delivered' }
  ];

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-profile">
      <div className="page-header">
        <div className="page-tag">My Account</div>
        <h1 className="page-title">Client <span>Profile</span></h1>
        <p className="page-desc">Manage your details, view your delivery history, and update saved addresses.</p>
      </div>

      <div className="profile-layout">
        {/* Left card */}
        <div>
          <div className="profile-card">
            <div className="profile-avatar-lg">JM</div>
            <div className="profile-name">{profileData.fullName}</div>
            <div className="profile-email">{profileData.email}</div>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-val">12</div>
                <div className="profile-stat-lbl">Deliveries</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">3</div>
                <div className="profile-stat-lbl">Active</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">1</div>
                <div className="profile-stat-lbl">Storage</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">4.9★</div>
                <div className="profile-stat-lbl">Rating</div>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={toggleEditMode}>
              ✏️ {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Right panels */}
        <div className="profile-content">
          {/* Personal Info */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">Personal Information</div>
              {!editMode && (
                <button className="info-edit-btn" onClick={toggleEditMode}>
                  Edit
                </button>
              )}
            </div>

            {!editMode ? (
              <div className="info-grid">
                <div className="info-field">
                  <div className="info-label">Full Name</div>
                  <div className="info-val">{profileData.fullName}</div>
                </div>
                <div className="info-field">
                  <div className="info-label">Phone</div>
                  <div className="info-val">{profileData.phone}</div>
                </div>
                <div className="info-field">
                  <div className="info-label">Email</div>
                  <div className="info-val">{profileData.email}</div>
                </div>
                <div className="info-field">
                  <div className="info-label">County</div>
                  <div className="info-val">{profileData.county}</div>
                </div>
                <div className="info-field">
                  <div className="info-label">ID Number</div>
                  <div className="info-val">{profileData.idNumber}</div>
                </div>
                <div className="info-field">
                  <div className="info-label">Member Since</div>
                  <div className="info-val">January 2024</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="field-group">
                  <div className="field-row">
                    <div className="field">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="field">
                      <label>Phone</label>
                      <input 
                        type="tel" 
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      />
                    </div>
                    <div className="field">
                      <label>County</label>
                      <select 
                        value={editFormData.county}
                        onChange={(e) => setEditFormData({...editFormData, county: e.target.value})}
                      >
                        <option>Nairobi</option>
                        <option>Mombasa</option>
                        <option>Kisumu</option>
                        <option>Nakuru</option>
                        <option>Eldoret</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" onClick={toggleEditMode}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveProfile}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delivery History */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">Delivery History</div>
              <button className="info-edit-btn">View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Route</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryHistory.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.tracking}</strong></td>
                      <td>{item.route}</td>
                      <td>{item.service}</td>
                      <td>{item.date}</td>
                      <td>
                        <span className={`status-pill status-${item.status}`}>
                          {item.status === 'delivered' ? 'Delivered' : 'In Transit'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="track-row-btn"
                          onClick={() => trackFromHistory(item.tracking)}
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;