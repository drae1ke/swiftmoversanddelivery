import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DriverDashboard.css';
import { 
  FaTruck, 
  FaSignOutAlt, 
  FaWallet, 
  FaBox, 
  FaClock, 
  FaCheckCircle, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaLocationArrow,
  FaStar
} from 'react-icons/fa';
import { apiRequest, getAuthToken, setAuthToken, getUserRole } from '../api';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    pending: 0,
  });
  const [driverProfile, setDriverProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    vehicleType: '',
    vehicleDescription: '',
    plateNumber: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      showToast({ message: 'Please log in as a driver to access the dashboard.', type: 'warning' });
      navigate('/Login');
      return;
    }

    const role = getUserRole();
    if (role && role !== 'driver') {
      showToast({ message: 'This page is only for drivers.', type: 'warning' });
      if (role === 'client') navigate('/Client');
      else if (role === 'admin') navigate('/AdminDashboard');
      else navigate('/');
      return;
    }

    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await apiRequest('/api/driver/dashboard');
      if (data.driver) {
        setDriverProfile(data.driver);
        setIsOnline(!!data.driver.isOnline);
        setProfileForm({
          vehicleType: data.driver.vehicleType || '',
          vehicleDescription: data.driver.vehicleDescription || '',
          plateNumber: data.driver.plateNumber || '',
        });
      }
      if (data.earnings) {
        setEarnings(data.earnings);
      }

      const mappedPending = (data.pendingOrders || []).map((order) => ({
        id: order._id,
        pickup: order.pickupAddress,
        dropoff: order.dropoffAddress,
        customer: order.recipientName || 'Client',
        phone: order.recipientPhone || '',
        package: `${order.packageWeightKg} kg`,
        price: order.priceKes,
        distance: `${order.distanceKm} km`,
        status: order.status,
      }));
      setPendingDeliveries(mappedPending);

      const rating = (data.driver && data.driver.rating) || 5;
      const mappedCompleted = (data.completedOrders || []).map((order) => ({
        id: order._id,
        route: `${order.pickupAddress}  ${order.dropoffAddress}`,
        date: order.deliveredAt
          ? new Date(order.deliveredAt).toLocaleDateString()
          : order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : '',
        earnings: order.priceKes,
        rating,
      }));
      setCompletedDeliveries(mappedCompleted);
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to load driver dashboard', type: 'error' });
      navigate('/Login');
    }
  };

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    showToast({
      message: next ? 'You are now online and receiving orders!' : 'You are now offline',
      type: 'info',
    });
    // Optional: call backend endpoint to persist isOnline if you add one.
  };

  const handleSignOut = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    navigate('/Login');
  };

  const handleAcceptDelivery = (id) => {
    showToast({ message: `Delivery ${id} accepted! Navigate to pickup location.`, type: 'success' });
  };

  const handleNavigate = (delivery) => {
    if (!delivery.pickup || !delivery.dropoff) {
      showToast({ message: 'Missing pickup or dropoff address for navigation.', type: 'warning' });
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      delivery.pickup,
    )}&destination=${encodeURIComponent(delivery.dropoff)}&travelmode=driving`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiRequest(`/api/driver/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast({ message: `Status updated to: ${status}`, type: 'info' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to update status', type: 'error' });
    }
  };

  const handleShareWhatsApp = async (delivery) => {
    if (!delivery.phone) {
      showToast({ message: 'No recipient phone number available for this delivery.', type: 'warning' });
      return;
    }

    const digits = delivery.phone.replace(/[^0-9]/g, '');
    if (!digits) {
      showToast({ message: 'Recipient phone number is invalid.', type: 'warning' });
      return;
    }

    // Optionally mark the order in-transit when sharing tracking via WhatsApp
    await handleUpdateStatus(delivery.id, 'in-transit');

    const message = `Hi ${delivery.customer || 'there'}, this is your SwiftDeliver driver.
Order ${delivery.id} from ${delivery.pickup} to ${delivery.dropoff}.
I am sharing this chat so you can request my live location in WhatsApp.`;

    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const updated = await apiRequest('/api/driver/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          vehicleType: profileForm.vehicleType,
          vehicleDescription: profileForm.vehicleDescription,
          plateNumber: profileForm.plateNumber,
        }),
      });
      setDriverProfile(updated);
      showToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="driver-dashboard">
      {/* Header */}
      <header className="driver-header">
        <div className="header-container">
          <div className="header-brand">
            <FaTruck className="icon-header" />
            <span>SwiftDeliver Driver</span>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-link">Dashboard</a>
            <a href="#" className="nav-link">Earnings</a>
            <button className="btn-signout" onClick={handleSignOut}>
              <FaSignOutAlt />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {/* Status Header */}
        <div className="status-header">
          <div>
            <h1 className="page-title">Driver Dashboard</h1>
            <p className="page-subtitle">Manage your deliveries and earnings</p>
          </div>
          <div className="online-toggle">
            <div className="online-indicator">
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
              <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={toggleOnline}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon wallet">
              <FaWallet />
            </div>
            <div className="stat-info">
              <p className="stat-label">Today</p>
              <p className="stat-value">KES {earnings.today.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon truck">
              <FaTruck />
            </div>
            <div className="stat-info">
              <p className="stat-label">This Week</p>
              <p className="stat-value">KES {earnings.week.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon package">
              <FaBox />
            </div>
            <div className="stat-info">
              <p className="stat-label">This Month</p>
              <p className="stat-value">KES {earnings.month.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon clock">
              <FaClock />
            </div>
            <div className="stat-info">
              <p className="stat-label">Pending</p>
              <p className="stat-value">KES {earnings.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <FaTruck />
              <span>Active</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <FaCheckCircle />
              <span>Completed</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser />
              <span>Profile</span>
            </button>
          </div>

          {/* Active Tab */}
          {activeTab === 'active' && (
            <div className="tab-content">
              {!isOnline ? (
                <div className="offline-card">
                  <FaTruck className="offline-icon" />
                  <h3 className="offline-title">You're Offline</h3>
                  <p className="offline-text">
                    Go online to start receiving delivery requests
                  </p>
                  <button className="btn-go-online" onClick={toggleOnline}>
                    Go Online
                  </button>
                </div>
              ) : (
                <div className="deliveries-list">
                  {pendingDeliveries.map((delivery) => (
                    <div key={delivery.id} className="delivery-card">
                      <div className="delivery-content">
                        <div className="delivery-header">
                          <span className="delivery-id">{delivery.id}</span>
                          <span className="delivery-badge assigned">Assigned</span>
                        </div>

                        <div className="delivery-route">
                          <div className="route-point pickup">
                            <div className="route-dot pickup-dot"></div>
                            <div>
                              <p className="route-label">Pickup</p>
                              <p className="route-address">{delivery.pickup}</p>
                            </div>
                          </div>
                          <div className="route-point dropoff">
                            <div className="route-dot dropoff-dot"></div>
                            <div>
                              <p className="route-label">Dropoff</p>
                              <p className="route-address">{delivery.dropoff}</p>
                            </div>
                          </div>
                        </div>

                        <div className="delivery-details">
                          <div className="detail-item">
                            <FaUser />
                            <span>{delivery.customer}</span>
                          </div>
                          <div className="detail-item">
                            <FaPhone />
                            <span>{delivery.phone}</span>
                          </div>
                          <div className="detail-item">
                            <FaBox />
                            <span>{delivery.package}</span>
                          </div>
                          <div className="detail-item">
                            <FaMapMarkerAlt />
                            <span>{delivery.distance}</span>
                          </div>
                        </div>
                      </div>

                      <div className="delivery-actions">
                        <p className="delivery-price">
                          KES {delivery.price.toLocaleString()}
                        </p>
                        <div className="action-buttons">
                          <button
                            className="btn-secondary"
                            onClick={() => handleUpdateStatus(delivery.id, 'Picked Up')}
                          >
                            Mark Picked Up
                          </button>
                          <button
                            className="btn-primary"
                            onClick={() => {
                              handleAcceptDelivery(delivery.id);
                              handleNavigate(delivery);
                            }}
                          >
                            <FaLocationArrow />
                            Navigate with Google Maps
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => handleShareWhatsApp(delivery)}
                          >
                            Share via WhatsApp
                          </button>
                        </div>
                        <p className="whatsapp-hint">
                          Tip: After opening WhatsApp, use "Share live location" so the recipient can track you in real time.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Completed Deliveries</h3>
                  <p className="card-description">Your delivery history</p>
                </div>
                <div className="card-body">
                  <div className="completed-list">
                    {completedDeliveries.map((delivery) => (
                      <div key={delivery.id} className="completed-item">
                        <div className="completed-info">
                          <div className="completed-header">
                            <span className="delivery-id">{delivery.id}</span>
                            <div className="rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={i < delivery.rating ? 'filled' : ''}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="completed-route">{delivery.route}</p>
                          <p className="completed-date">{delivery.date}</p>
                        </div>
                        <div className="completed-earnings">
                          <p className="earnings-amount">
                            +KES {delivery.earnings.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="profile-grid">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Driver Profile</h3>
                  </div>
                  <div className="card-body">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        <FaUser />
                      </div>
                      <div className="profile-info">
                        <p className="profile-name">{driverProfile?.user?.fullName || 'Driver'}</p>
                        <p className="profile-id">Driver ID: {driverProfile?.id || 'DRV-0000'}</p>
                        <div className="profile-rating">
                          <FaStar className="filled" />
                          <span className="rating-value">{driverProfile?.rating ?? 4.8}</span>
                          <span className="rating-count">({driverProfile?.totalTrips ?? 0} trips)</span>
                        </div>
                      </div>
                    </div>
                    <div className="profile-details">
                      <div className="detail-row">
                        <span className="detail-label">Vehicle</span>
                        <span className="detail-value">{driverProfile?.vehicleDescription || driverProfile?.vehicleType || 'Vehicle'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Plate Number</span>
                        <span className="detail-value">{driverProfile?.plateNumber || 'Plate number'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Member Since</span>
                        <span className="detail-value">
                          {driverProfile?.user?.createdAt
                            ? new Date(driverProfile.user.createdAt).toLocaleDateString()
                            : 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Update Vehicle Details</h3>
                  </div>
                  <div className="card-body">
                    <div className="profile-form">
                      <div className="form-group">
                        <label className="form-label">Vehicle Type</label>
                        <select
                          className="form-input"
                          value={profileForm.vehicleType}
                          onChange={(e) => handleProfileChange('vehicleType', e.target.value)}
                        >
                          <option value="">Select vehicle type</option>
                          <option value="bicycle">Bicycle</option>
                          <option value="bike">Bike</option>
                          <option value="car">Car</option>
                          <option value="van">Van</option>
                          <option value="lorry">Lorry</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Vehicle Description</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Toyota Probox, White"
                          value={profileForm.vehicleDescription}
                          onChange={(e) => handleProfileChange('vehicleDescription', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Plate Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. KDG 456Y"
                          value={profileForm.plateNumber}
                          onChange={(e) => handleProfileChange('plateNumber', e.target.value)}
                        />
                      </div>
                      <button
                        className="btn-primary full-width"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <>
                            <span className="button-spinner" />
                            Saving Profile...
                          </>
                        ) : (
                          'Save Profile'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Performance</h3>
                  </div>
                  <div className="card-body">
                    <div className="performance-metrics">
                      <div className="metric">
                        <div className="metric-header">
                          <span className="metric-label">Completion Rate</span>
                          <span className="metric-value">98%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-header">
                          <span className="metric-label">On-Time Delivery</span>
                          <span className="metric-value">95%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-header">
                          <span className="metric-label">Customer Rating</span>
                          <span className="metric-value">96%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '96%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverDashboard;