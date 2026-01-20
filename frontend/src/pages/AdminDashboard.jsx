import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import { apiRequest, getAuthToken, setAuthToken, getUserRole } from '../api';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [pricingSettings, setPricingSettings] = useState({
    baseCostPerKm: 50,
    urbanMultiplier: 1.0,
    ruralMultiplier: 1.3,
    offroadMultiplier: 1.8,
    lowTrafficMultiplier: 1.0,
    mediumTrafficMultiplier: 1.2,
    highTrafficMultiplier: 1.5,
    sameDayMultiplier: 2.0,
    nextDayMultiplier: 1.5,
    scheduledMultiplier: 1.0,
  });
  const [weightBands, setWeightBands] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({
    vehicleType: '',
    vehicleDescription: '',
    plateNumber: '',
  });
  const [savingDriver, setSavingDriver] = useState(false);
  const [ordersPage, setOrdersPage] = useState({ data: [], page: 1, total: 0, totalPages: 1 });
  const [assignmentSelection, setAssignmentSelection] = useState({}); // orderId -> driverId
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      showToast({ message: 'Please log in as an admin to access the dashboard.', type: 'warning' });
      navigate('/Login');
      return;
    }

    const role = getUserRole();
    if (role && role !== 'admin') {
      showToast({ message: 'This page is only for admins.', type: 'warning' });
      if (role === 'driver') navigate('/DriverDashboard');
      else if (role === 'client') navigate('/Client');
      else navigate('/');
      return;
    }

    loadDashboard();
    loadDrivers();
    loadOrders(1);
    loadWeightBands();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDefaultWeightBands = () => [
    { label: '0 - 5 kg', minKg: 0, maxKg: 5, pricePerKm: 50 },
    { label: '5 - 20 kg', minKg: 5, maxKg: 20, pricePerKm: 60 },
    { label: '20 - 50 kg', minKg: 20, maxKg: 50, pricePerKm: 80 },
    { label: '50 - 100 kg', minKg: 50, maxKg: 100, pricePerKm: 100 },
  ];

  const loadDashboard = async () => {
    try {
      const data = await apiRequest('/api/admin/dashboard');
      if (data.stats) {
        setStats(data.stats);
      }
      const mapped = (data.recentDeliveries || []).map((delivery) => ({
        id: delivery._id,
        client: delivery.client?.fullName || '',
        driver: delivery.driver?.user?.fullName || '',
        route: `${delivery.pickupAddress}  ${delivery.dropoffAddress}`,
        status: delivery.status,
        amount: delivery.priceKes,
      }));
      setRecentDeliveries(mapped);
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to load admin dashboard', type: 'error' });
      navigate('/Login');
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await apiRequest('/api/admin/drivers');
      setDrivers(data || []);
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to load drivers', type: 'error' });
    }
  };

  const loadOrders = async (page = 1) => {
    try {
      const data = await apiRequest(`/api/admin/orders?page=${page}&limit=20`);
      const mapped = (data.data || []).map((order) => ({
        id: order._id,
        client: order.client?.fullName || '',
        driver: order.driver?.user?.fullName || '',
        driverId: order.driver?._id || null,
        route: `${order.pickupAddress} \u0010 ${order.dropoffAddress}`,
        status: order.status,
        amount: order.priceKes,
      }));

      // Show unassigned orders first
      mapped.sort((a, b) => {
        const aUnassigned = !a.driverId;
        const bUnassigned = !b.driverId;
        if (aUnassigned === bUnassigned) return 0;
        return aUnassigned ? -1 : 1;
      });

      setOrdersPage({
        data: mapped,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to load orders', type: 'error' });
    }
  };

  const loadWeightBands = async () => {
    try {
      const data = await apiRequest('/api/admin/pricing/weight-bands');
      if (data && typeof data.baseCostPerKm === 'number') {
        setPricingSettings((prev) => ({
          ...prev,
          baseCostPerKm: data.baseCostPerKm,
        }));
      }
      if (Array.isArray(data?.weightBands) && data.weightBands.length > 0) {
        setWeightBands(data.weightBands);
      } else {
        setWeightBands(getDefaultWeightBands());
      }
    } catch (err) {
      console.error(err);
      setWeightBands(getDefaultWeightBands());
      showToast({ message: err.message || 'Failed to load pricing configuration', type: 'error' });
    }
  };

  const handleSignOut = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    navigate('/Login');
  };

  const handleAssignmentChange = (orderId, driverId) => {
    setAssignmentSelection((prev) => ({
      ...prev,
      [orderId]: driverId,
    }));
  };

  const handleAssignDriver = async (orderId) => {
    const driverId = assignmentSelection[orderId];
    if (!driverId) {
      showToast({ message: 'Please select a driver to assign.', type: 'warning' });
      return;
    }

    try {
      setAssigningOrderId(orderId);
      await apiRequest(`/api/admin/orders/${orderId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ driverId }),
      });
      showToast({ message: 'Order assigned successfully', type: 'success' });
      loadOrders(ordersPage.page);
      loadDashboard();
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to assign driver', type: 'error' });
    } finally {
      setAssigningOrderId(null);
    }
  };

  const filteredOrders = ordersPage.data.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (showUnassignedOnly && order.driverId) return false;
    return true;
  });

  const summaryCards = stats
    ? [
        {
          title: 'Total Revenue',
          value: `KES ${stats.totalRevenue.toLocaleString()}`,
          change: '',
          icon: 'fa-dollar-sign',
          color: 'revenue',
        },
        {
          title: 'Active Drivers',
          value: String(stats.activeDrivers),
          change: '',
          icon: 'fa-truck',
          color: 'drivers',
        },
        {
          title: 'Total Clients',
          value: String(stats.totalClients),
          change: '',
          icon: 'fa-users',
          color: 'clients',
        },
        {
          title: 'Deliveries Today',
          value: String(stats.deliveriesToday),
          change: '',
          icon: 'fa-box',
          color: 'deliveries',
        },
      ]
    : [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { className: 'badge-delivered', text: 'Delivered' },
      'in-transit': { className: 'badge-in-transit', text: 'In Transit' },
      pending: { className: 'badge-pending', text: 'Pending' },
      assigned: { className: 'badge-pending', text: 'Assigned' },
      online: { className: 'badge-online', text: 'Online' },
      busy: { className: 'badge-busy', text: 'Busy' },
      offline: { className: 'badge-offline', text: 'Offline' },
    };
    const config = statusConfig[status] || { className: 'badge-default', text: status };
    return <span className={`badge ${config.className}`}>{config.text}</span>;
  };

  const handleSavePricing = async () => {
    try {
      setSavingPricing(true);
      const payload = {
        baseCostPerKm: pricingSettings.baseCostPerKm,
        weightBands: weightBands.map((band) => ({
          label: band.label || `${band.minKg} - ${band.maxKg} kg`,
          minKg: Number(band.minKg) || 0,
          maxKg: Number(band.maxKg) || 0,
          pricePerKm: Number(band.pricePerKm) || 0,
        })),
      };

      await apiRequest('/api/admin/pricing/weight-bands', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      showToast({ message: 'Pricing settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to save pricing settings', type: 'error' });
    } finally {
      setSavingPricing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPricingSettings({
      ...pricingSettings,
      [field]: parseFloat(value),
    });
  };

  const openDriverEditor = (driver) => {
    setEditingDriver(driver);
    setDriverForm({
      vehicleType: driver.vehicleType || '',
      vehicleDescription: driver.vehicleDescription || '',
      plateNumber: driver.plateNumber || '',
    });
  };

  const handleDriverFormChange = (field, value) => {
    setDriverForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveDriver = async () => {
    if (!editingDriver) return;
    try {
      setSavingDriver(true);
      const updated = await apiRequest(`/api/admin/drivers/${editingDriver._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          vehicleType: driverForm.vehicleType,
          vehicleDescription: driverForm.vehicleDescription,
          plateNumber: driverForm.plateNumber,
        }),
      });
      setDrivers((prev) =>
        prev.map((d) => (d._id === updated._id ? updated : d))
      );
      setEditingDriver(updated);
      showToast({ message: 'Driver details updated', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to update driver', type: 'error' });
    } finally {
      setSavingDriver(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-container">
          <div className="header-brand">
            <i className="fas fa-shield-alt"></i>
            <span>SwiftDeliver Admin</span>
          </div>
          <div className="header-nav">
            <a href="#" className="nav-link">Dashboard</a>
            <a href="#" className="nav-link">Settings</a>
            <button className="btn-signout" onClick={handleSignOut}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage your delivery platform</p>
          </div>
          <div className="admin-badge">
            <i className="fas fa-shield-alt"></i>
            <span>Admin Access</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {summaryCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <p className="stat-label">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-change">{stat.change}</p>
                </div>
                <div className={`icon ${stat.color}`}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-bar"></i>
              <span>Overview</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'drivers' ? 'active' : ''}`}
              onClick={() => setActiveTab('drivers')}
            >
              <i className="fas fa-truck"></i>
              <span>Drivers</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-box"></i>
              <span>Orders</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={() => setActiveTab('pricing')}
            >
              <i className="fas fa-cog"></i>
              <span>Pricing</span>
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="overview-grid">
                {/* Live Map */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-map-marked-alt"></i>
                      Live Delivery Map
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="map-placeholder">
                      <i className="fas fa-chart-line map-icon"></i>
                      <p className="map-text">
                        Live tracking of {recentDeliveries.filter(d => d.status === 'in-transit').length} active deliveries
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-chart-line"></i>
                      Recent Activity
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="activity-list">
                      {recentDeliveries.map((delivery) => (
                        <div key={delivery.id} className="activity-item">
                          <div className="activity-info">
                            <div className="activity-header">
                              <span className="delivery-id">{delivery.id}</span>
                              {getStatusBadge(delivery.status)}
                            </div>
                            <p className="activity-route">{delivery.route}</p>
                          </div>
                          <p className="activity-amount">KES {delivery.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="tab-content">
                <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Driver Management</h3>
                  <p className="card-description">View and manage all registered drivers</p>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Driver ID</th>
                          <th>Name</th>
                          <th>Vehicle</th>
                          <th>Plate</th>
                          <th>Status</th>
                          <th>Trips</th>
                          <th>Rating</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map((driver) => (
                          <tr key={driver._id}>
                            <td className="driver-id">{driver._id}</td>
                            <td className="driver-name">{driver.user?.fullName || 'Unknown'}</td>
                            <td className="driver-vehicle">{driver.vehicleDescription || driver.vehicleType || ''}</td>
                            <td className="driver-vehicle">{driver.plateNumber || ''}</td>
                            <td>{getStatusBadge(driver.isOnline ? 'online' : 'offline')}</td>
                            <td>{driver.totalTrips}</td>
                            <td>
                              <span className="rating">
                                <i className="fas fa-star"></i> {driver.rating}
                              </span>
                            </td>
                            <td>
                              <button className="btn-view" onClick={() => openDriverEditor(driver)}>
                                View / Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {editingDriver && (
                    <div className="driver-edit-panel">
                      <h4 className="section-title">Edit Driver Details</h4>
                      <p className="driver-edit-subtitle">
                        {editingDriver.user?.fullName} ({editingDriver._id})
                      </p>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Vehicle Type</label>
                          <select
                            className="form-input"
                            value={driverForm.vehicleType}
                            onChange={(e) => handleDriverFormChange('vehicleType', e.target.value)}
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
                            value={driverForm.vehicleDescription}
                            onChange={(e) => handleDriverFormChange('vehicleDescription', e.target.value)}
                            placeholder="e.g. Toyota Probox, White"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Plate Number</label>
                          <input
                            type="text"
                            className="form-input"
                            value={driverForm.plateNumber}
                            onChange={(e) => handleDriverFormChange('plateNumber', e.target.value)}
                            placeholder="e.g. KDG 456Y"
                          />
                        </div>
                      </div>
                      <div className="driver-edit-actions">
                        <button
                          className="btn-save"
                          onClick={handleSaveDriver}
                          disabled={savingDriver}
                        >
                          {savingDriver ? (
                            <>
                              <span className="button-spinner" />
                              Saving Driver...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                        <button
                          className="btn-view"
                          onClick={() => setEditingDriver(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">All Orders</h3>
                  <p className="card-description">Track and manage delivery orders</p>
                </div>
                <div className="card-body">
                  <div className="orders-filters">
                    <div className="filter-group">
                      <label className="filter-label">
                        Status:
                        <select
                          className="filter-select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All</option>
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </label>
                    </div>
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={showUnassignedOnly}
                        onChange={(e) => setShowUnassignedOnly(e.target.checked)}
                      />
                      <span>Unassigned only</span>
                    </label>
                  </div>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Client</th>
                          <th>Driver</th>
                          <th>Route</th>
                          <th>Status</th>
                          <th>Amount</th>
                          <th>Assign</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="order-id">{order.id}</td>
                            <td className="order-client">{order.client}</td>
                            <td className="order-driver">{order.driver || ''}</td>
                            <td className="order-route">{order.route}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td className="order-amount">KES {order.amount.toLocaleString()}</td>
                            <td>
                              <div className="assign-controls">
                                <select
                                  className="assign-select"
                                  value={assignmentSelection[order.id] || ''}
                                  onChange={(e) => handleAssignmentChange(order.id, e.target.value)}
                                >
                                  <option value="">Select driver</option>
                                  {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                      {driver.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="btn-assign"
                                  onClick={() => handleAssignDriver(order.id)}
                                  disabled={assigningOrderId === order.id}
                                >
                                  {assigningOrderId === order.id ? (
                                    <>
                                      <span className="button-spinner" />
                                      Assigning...
                                    </>
                                  ) : (
                                    'Assign'
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="orders-pagination">
                    <button
                      className="btn-page"
                      disabled={ordersPage.page <= 1}
                      onClick={() => loadOrders(ordersPage.page - 1)}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {ordersPage.page} of {ordersPage.totalPages}
                    </span>
                    <button
                      className="btn-page"
                      disabled={ordersPage.page >= ordersPage.totalPages}
                      onClick={() => loadOrders(ordersPage.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Pricing Configuration</h3>
                  <p className="card-description">
                    Configure pricing rules for terrain, traffic, and delivery time
                  </p>
                </div>
                <div className="card-body pricing-form">
                  {/* Base Pricing */}
                  <div className="pricing-section">
                    <h4 className="section-title">Base Pricing</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Cost per KM (KES)</label>
                        <input
                          type="number"
                          value={pricingSettings.baseCostPerKm}
                          onChange={(e) => handleInputChange('baseCostPerKm', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight Bands */}
                  <div className="pricing-section">
                    <h4 className="section-title">Weight Bands (up to 20)</h4>
                    <p className="section-subtitle">
                      Configure weight ranges and price per KM. Clients will see these as options when booking.
                    </p>
                    <div className="weight-bands-table">
                      <div className="weight-bands-header">
                        <span>Label</span>
                        <span>Min (kg)</span>
                        <span>Max (kg)</span>
                        <span>Price per KM (KES)</span>
                        <span></span>
                      </div>
                      {weightBands.map((band, index) => (
                        <div key={index} className="weight-bands-row">
                          <input
                            type="text"
                            className="form-input"
                            value={band.label}
                            onChange={(e) =>
                              setWeightBands((prev) =>
                                prev.map((b, i) =>
                                  i === index ? { ...b, label: e.target.value } : b
                                )
                              )
                            }
                          />
                          <input
                            type="number"
                            className="form-input"
                            value={band.minKg}
                            onChange={(e) =>
                              setWeightBands((prev) =>
                                prev.map((b, i) =>
                                  i === index ? { ...b, minKg: Number(e.target.value) } : b
                                )
                              )
                            }
                          />
                          <input
                            type="number"
                            className="form-input"
                            value={band.maxKg}
                            onChange={(e) =>
                              setWeightBands((prev) =>
                                prev.map((b, i) =>
                                  i === index ? { ...b, maxKg: Number(e.target.value) } : b
                                )
                              )
                            }
                          />
                          <input
                            type="number"
                            className="form-input"
                            value={band.pricePerKm}
                            onChange={(e) =>
                              setWeightBands((prev) =>
                                prev.map((b, i) =>
                                  i === index ? { ...b, pricePerKm: Number(e.target.value) } : b
                                )
                              )
                            }
                          />
                          <button
                            type="button"
                            className="btn-view"
                            onClick={() =>
                              setWeightBands((prev) => prev.filter((_, i) => i !== index))
                            }
                            disabled={weightBands.length <= 1}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn-save"
                        onClick={() =>
                          setWeightBands((prev) => {
                            if (prev.length >= 20) return prev;
                            const last = prev[prev.length - 1];
                            const nextMin = last ? last.maxKg : 0;
                            const nextMax = nextMin + 10;
                            return [
                              ...prev,
                              {
                                label: `${nextMin} - ${nextMax} kg`,
                                minKg: nextMin,
                                maxKg: nextMax,
                                pricePerKm: last ? last.pricePerKm : pricingSettings.baseCostPerKm,
                              },
                            ];
                          })
                        }
                        disabled={weightBands.length >= 20}
                      >
                        + Add Weight Band
                      </button>
                    </div>
                  </div>

                  {/* Terrain Multipliers */}
                  <div className="pricing-section">
                    <h4 className="section-title">Terrain Multipliers</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Urban</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.urbanMultiplier}
                          onChange={(e) => handleInputChange('urbanMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Rural</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.ruralMultiplier}
                          onChange={(e) => handleInputChange('ruralMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Off-road</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.offroadMultiplier}
                          onChange={(e) => handleInputChange('offroadMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Traffic Multipliers */}
                  <div className="pricing-section">
                    <h4 className="section-title">Traffic Multipliers</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Low Traffic</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.lowTrafficMultiplier}
                          onChange={(e) => handleInputChange('lowTrafficMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Medium Traffic</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.mediumTrafficMultiplier}
                          onChange={(e) => handleInputChange('mediumTrafficMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>High Traffic</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.highTrafficMultiplier}
                          onChange={(e) => handleInputChange('highTrafficMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Speed Multipliers */}
                  <div className="pricing-section">
                    <h4 className="section-title">Delivery Speed Multipliers</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Same Day</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.sameDayMultiplier}
                          onChange={(e) => handleInputChange('sameDayMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Next Day</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.nextDayMultiplier}
                          onChange={(e) => handleInputChange('nextDayMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Scheduled (2-3 Days)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pricingSettings.scheduledMultiplier}
                          onChange={(e) => handleInputChange('scheduledMultiplier', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="btn-save" onClick={handleSavePricing} disabled={savingPricing}>
                    {savingPricing ? (
                      <>
                        <span className="button-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Pricing Settings
                      </>
                    )}
                  </button>
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

export default AdminDashboard;