import React, { useState, useEffect } from 'react';
import { getMe, updateMe, getMyOrders } from '../../api';

const Profile = ({ isActive, onShowPage }) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    county: '',
    idNumber: ''
  });

  const [editFormData, setEditFormData] = useState({ ...profileData });
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    activeOrders: 0,
    rating: 4.5
  });

  // Load profile and orders on mount
  useEffect(() => {
    if (isActive) {
      fetchProfileAndOrders();
    }
  }, [isActive]);

  const fetchProfileAndOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile
      const userProfile = await getMe();
      setProfileData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        county: userProfile.county || '',
        idNumber: userProfile.idNumber || ''
      });
      setEditFormData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        county: userProfile.county || '',
        idNumber: userProfile.idNumber || ''
      });
      
      // Fetch user's orders
      const ordersData = await getMyOrders();
      const orders = ordersData.orders || [];
      
      // Transform orders to delivery history format
      const history = orders.map(order => ({
        tracking: order._id,
        route: `${order.pickupLocation} → ${order.deliveryLocation}`,
        service: order.serviceType || 'Delivery',
        date: new Date(order.createdAt).toLocaleDateString(),
        status: order.status
      }));
      
      setDeliveryHistory(history);
      
      // Calculate stats
      setStats({
        totalDeliveries: orders.length,
        activeOrders: orders.filter(o => o.status !== 'delivered').length,
        rating: userProfile.rating || 4.5
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Cancel editing - revert changes
      setEditFormData({ ...profileData });
    }
    setEditMode(!editMode);
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      await updateMe(editFormData);
      setProfileData({ ...editFormData });
      setEditMode(false);
      alert('✓ Profile saved');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackFromHistory = (code) => {
    sessionStorage.setItem('trackingCode', code);
    onShowPage('tracking');
  };

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
            <div className="profile-avatar-lg">{profileData.fullName?.substring(0, 2).toUpperCase() || 'US'}</div>
            <div className="profile-name">{profileData.fullName || 'User'}</div>
            <div className="profile-email">{profileData.email}</div>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-val">{stats.totalDeliveries}</div>
                <div className="profile-stat-lbl">Deliveries</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{stats.activeOrders}</div>
                <div className="profile-stat-lbl">Active</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">—</div>
                <div className="profile-stat-lbl">Storage</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{stats.rating}★</div>
                <div className="profile-stat-lbl">Rating</div>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={toggleEditMode} disabled={loading}>
              ✏️ {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Right panels */}
        <div className="profile-content">
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}
          
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
                  <button className="btn btn-outline" onClick={toggleEditMode} disabled={loading}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
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