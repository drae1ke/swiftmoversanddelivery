import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientDashboard.css';
import { FaSignOutAlt,FaBusAlt,FaBicycle,FaMotorcycle,FaShuttleVan,FaCar } from 'react-icons/fa';
import { apiRequest, getAuthToken, setAuthToken, getUserRole } from '../api';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';

const Client = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('book');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distance, setDistance] = useState(15);
  const [estimatedPrice, setEstimatedPrice] = useState(750);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageWeight, setPackageWeight] = useState(5);
  const [vehicleType, setVehicleType] = useState('');
  const [serviceType, setServiceType] = useState('Standard');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [booking, setBooking] = useState(false);
  const [weightBands, setWeightBands] = useState([]);
  const [selectedWeightBandIndex, setSelectedWeightBandIndex] = useState(null);
  const [baseCostPerKm, setBaseCostPerKm] = useState(50);

  useEffect(() => {
    // Basic auth guard: redirect to login if no token
    if (!getAuthToken()) {
      showToast({ message: 'Please log in to access the client dashboard.', type: 'warning' });
      navigate('/Login');
      return;
    }

    const role = getUserRole();
    if (role && role !== 'client') {
      showToast({ message: 'This page is only for clients.', type: 'warning' });
      if (role === 'driver') navigate('/DriverDashboard');
      else if (role === 'admin') navigate('/AdminDashboard');
      else navigate('/');
      return;
    }

    fetchOrders();
    loadWeightBands();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await apiRequest('/api/orders/my');
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to load orders', type: 'error' });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignOut = () => {
    setAuthToken(null);
    // also clear stored user info if desired
    localStorage.removeItem('user');
    navigate('/Login');
  };

  const calculatePrice = (dist, weight, vehicle, service) => {
    let perKm = baseCostPerKm || 50;

    if (Array.isArray(weightBands) && weightBands.length > 0) {
      const band = weightBands.find(
        (b) =>
          typeof b.minKg === 'number' &&
          typeof b.maxKg === 'number' &&
          weight >= b.minKg &&
          weight <= b.maxKg
      );
      if (band && typeof band.pricePerKm === 'number') {
        perKm = band.pricePerKm;
      }
    }

    const vehicleFactor = vehicle === 'bike' ? 0.8 : vehicle === 'car' ? 1 : vehicle === 'van' ? 1.5 : 1;
    const serviceFactor = service === 'Express' ? 1.5 : service === 'Same Day' ? 1.3 : 1;
    const price = Math.round(dist * perKm * vehicleFactor * serviceFactor);
    setEstimatedPrice(price);
  };

  const handleBookDelivery = async () => {
    if (!pickup || !dropoff) {
      showToast({ message: 'Please select pickup and dropoff locations', type: 'warning' });
      return;
    }
    if (!recipientName || !recipientPhone) {
      showToast({ message: 'Please enter recipient details', type: 'warning' });
      return;
    }

    if (!vehicleType) {
      showToast({ message: 'Please select a vehicle type', type: 'warning' });
      return;
    }

    try {
      setBooking(true);
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          recipientName,
          recipientPhone,
          distanceKm: distance,
          packageWeightKg: packageWeight,
          vehicleType,
          serviceType,
        }),
      });

      showToast({
        message: `Delivery booked successfully! From ${order.pickupAddress} to ${order.dropoffAddress}. Price: KES ${order.priceKes.toLocaleString()}`,
        type: 'success',
      });
      setActiveTab('orders');
      fetchOrders();
    } catch (err) {
      showToast({ message: err.message || 'Failed to book delivery', type: 'error' });
    } finally {
      setBooking(false);
    }
  };

  const loadWeightBands = async () => {
    try {
      const data = await apiRequest('/api/orders/pricing/weight-bands');
      if (data && typeof data.baseCostPerKm === 'number') {
        setBaseCostPerKm(data.baseCostPerKm);
      }
      if (Array.isArray(data?.weightBands)) {
        setWeightBands(data.weightBands);
        if (data.weightBands.length > 0) {
          setSelectedWeightBandIndex(0);
          const firstBand = data.weightBands[0];
          const representativeWeight = firstBand.minKg || 1;
          setPackageWeight(representativeWeight);
          calculatePrice(distance, representativeWeight, vehicleType, serviceType);
        }
      }
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to load pricing information', type: 'error' });
    }
  };

  const recentOrders = orders.map((order) => ({
    id: order._id,
    from: order.pickupAddress,
    to: order.dropoffAddress,
    status: order.status,
    price: order.priceKes,
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
  }));

  const fetchLiveEstimate = async () => {
    if (!pickup || !dropoff) {
      showToast({ message: 'Enter pickup and dropoff addresses first.', type: 'warning' });
      return;
    }
    if (!vehicleType) {
      showToast({ message: 'Select a vehicle type first.', type: 'warning' });
      return;
    }

    try {
      const result = await apiRequest('/api/orders/estimate', {
        method: 'POST',
        body: JSON.stringify({
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          packageWeightKg: packageWeight,
          vehicleType,
          serviceType,
        }),
      });

      if (result && typeof result.distanceKm === 'number') {
        const rounded = Math.round(result.distanceKm * 10) / 10;
        setDistance(rounded);
      }
      if (result && typeof result.priceKes === 'number') {
        setEstimatedPrice(result.priceKes);
      }

      showToast({ message: 'Price updated using live Google distance.', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: err.message || 'Failed to fetch live price estimate', type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { className: 'badge-delivered', text: 'Delivered' },
      'in-transit': { className: 'badge-in-transit', text: 'In Transit' },
      pending: { className: 'badge-pending', text: 'Pending' },
    };
    const config = statusConfig[status] || { className: 'badge-default', text: status };
    return <span className={`badge ${config.className}`}>{config.text}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-brand">
            <i className="fas fa-truck-fast"></i>
            <span>SwiftDeliver</span>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-link">Client</a>
            <a href="#" className="nav-link">Profile</a>
            <button className="btn-signout" onClick={handleSignOut}>
              <FaSignOutAlt />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        <div className="page-header">
          <h1 className="page-title">Book a Delivery</h1>
          <p className="page-subtitle">
            Send packages anywhere in Kenya with transparent pricing
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
            >
              <i className="fas fa-box"></i>
              <span>New Delivery</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-clock"></i>
              <span>My Orders</span>
            </button>
          </div>

          {/* Book Delivery Tab */}
          {activeTab === 'book' && (
            <div className="tab-content">
              <div className="grid-layout">
                {/* Left Column */}
                <div className="left-column">
                  {/* Map Card */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-map-marked-alt"></i>
                        Select Locations
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-map-marker-alt label-icon"></i>
                          Pickup Location
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter pickup address"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-map-marker-alt label-icon"></i>
                          Dropoff Location
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter dropoff address"
                          value={dropoff}
                          onChange={(e) => setDropoff(e.target.value)}
                        />
                      </div>
                      <div className="map-placeholder">
                        <i className="fas fa-map"></i>
                        <p>Interactive map will appear here</p>
                        <span className="distance-badge">Distance: {distance} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Details Card */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-user"></i>
                        Recipient Details
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label">Recipient Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter recipient's name"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="input-with-icon">
                          <i className="fas fa-phone input-icon"></i>
                          <input
                            type="tel"
                            className="form-input icon-input"
                            placeholder="+254 7XX XXX XXX"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                  {/* Price Calculator Card */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-calculator"></i>
                        Price Calculator
                      </h3>
                    </div>
                    <div className="card-body">
                      {/* Package Weight */}
                      <div className="form-group">
                        <div className="slider-header">
                          <label className="form-label">Package Weight</label>
                          <span className="slider-value">
                            {Array.isArray(weightBands) && weightBands.length > 0 && selectedWeightBandIndex !== null
                              ? weightBands[selectedWeightBandIndex]?.label
                              : `${packageWeight} kg`}
                          </span>
                        </div>
                        {Array.isArray(weightBands) && weightBands.length > 0 ? (
                          <select
                            className="form-input"
                            value={selectedWeightBandIndex ?? ''}
                            onChange={(e) => {
                              const index = e.target.value === '' ? null : Number(e.target.value);
                              setSelectedWeightBandIndex(index);
                              if (index !== null && weightBands[index]) {
                                const band = weightBands[index];
                                const representativeWeight = band.minKg || 1;
                                setPackageWeight(representativeWeight);
                                calculatePrice(distance, representativeWeight, vehicleType, serviceType);
                              }
                            }}
                          >
                            {weightBands.map((band, index) => (
                              <option key={index} value={index}>
                                {band.label} — {band.pricePerKm} KES/km
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="range"
                            min="1"
                            max="500000"
                            value={packageWeight}
                            onChange={(e) => {
                              const weight = parseInt(e.target.value);
                              setPackageWeight(weight);
                              calculatePrice(distance, weight, vehicleType, serviceType);
                            }}
                            className="slider"
                          />
                        )}
                      </div>

                      {/* Vehicle Type */}
                      <div className="form-group">
                        <label className="form-label">Vehicle Type</label>
                        <div className="vehicle-options">
                          <button
                            className={`vehicle-btn ${vehicleType === 'bicycle' ? 'active' : ''}`}
                            onClick={() => {
                              setVehicleType('bicycle');
                              calculatePrice(distance, packageWeight, 'bicycle', serviceType);
                            }}
                          >
                            <FaBicycle />
                            <span>Bicycle</span>
                          </button>
                           <button
                            className={`vehicle-btn ${vehicleType === 'bike' ? 'active' : ''}`}
                            onClick={() => {
                              setVehicleType('bike');
                              calculatePrice(distance, packageWeight, 'bike', serviceType);
                            }}
                          >
                            <FaMotorcycle />
                            <span>Bike</span>
                          </button>
                           <button
                            className={`vehicle-btn ${vehicleType === 'car' ? 'active' : ''}`}
                            onClick={() => {
                              setVehicleType('car');
                              calculatePrice(distance, packageWeight, 'car', serviceType);
                            }}
                          >
                            <FaCar />
                            <span>Car</span>
                          </button>
                          <button
                            className={`vehicle-btn ${vehicleType === 'van' ? 'active' : ''}`}
                            onClick={() => {
                              setVehicleType('van');
                              calculatePrice(distance, packageWeight, 'van', serviceType);
                            }}
                          >
                            <FaShuttleVan />
                            <span>Van</span>
                          </button>
                          <button
                            className={`vehicle-btn ${vehicleType === 'lorry' ? 'active' : ''}`}
                            onClick={() => {
                              setVehicleType('lorry');
                              calculatePrice(distance, packageWeight, 'lorry', serviceType);
                            }}
                          >
                            <FaBusAlt />
                            <span>Lorry</span>
                          </button>
                        </div>
                      </div>

                      {/* Service Type */}
                      <div className="form-group">
                        <label className="form-label">Delivery Speed</label>
                        <div className="service-options">
                          <label className="service-option">
                            <input
                              type="radio"
                              name="service"
                              value="Standard"
                              checked={serviceType === 'Standard'}
                              onChange={(e) => {
                                setServiceType(e.target.value);
                                calculatePrice(distance, packageWeight, vehicleType, e.target.value);
                              }}
                            />
                            <div className="service-card">
                              <i className="fas fa-clock"></i>
                              <span>Standard</span>
                              <small>2-3 days</small>
                            </div>
                          </label>
                          <label className="service-option">
                            <input
                              type="radio"
                              name="service"
                              value="Same Day"
                              checked={serviceType === 'Same Day'}
                              onChange={(e) => {
                                setServiceType(e.target.value);
                                calculatePrice(distance, packageWeight, vehicleType, e.target.value);
                              }}
                            />
                            <div className="service-card">
                              <i className="fas fa-bolt"></i>
                              <span>Same Day</span>
                              <small>Within 24hrs</small>
                            </div>
                          </label>
                          <label className="service-option">
                            <input
                              type="radio"
                              name="service"
                              value="Express"
                              checked={serviceType === 'Express'}
                              onChange={(e) => {
                                setServiceType(e.target.value);
                                calculatePrice(distance, packageWeight, vehicleType, e.target.value);
                              }}
                            />
                            <div className="service-card">
                              <i className="fas fa-rocket"></i>
                              <span>Express</span>
                              <small>2-4 hours</small>
                            </div>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-live-estimate"
                        onClick={fetchLiveEstimate}
                      >
                        Use Google Distance for Price
                      </button>

                      {/* Price Summary */}
                      <div className="price-summary">
                        <div className="price-row">
                          <span>Distance</span>
                          <strong>{distance} km</strong>
                        </div>
                        <div className="price-row">
                          <span>Weight</span>
                          <strong>{packageWeight} kg</strong>
                        </div>
                        <div className="price-row">
                          <span>Service</span>
                          <strong>{serviceType}</strong>
                        </div>
                        <div className="price-divider"></div>
                        <div className="price-total">
                          <span>Estimated Total</span>
                          <strong>KES {estimatedPrice.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button className="btn-book" onClick={handleBookDelivery} disabled={booking}>
                    {booking ? (
                      <>
                        <span className="button-spinner" />
                        Booking Delivery...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-truck"></i>
                        Book Delivery for KES {estimatedPrice.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Orders</h3>
                  <p className="card-description">Track and manage your deliveries</p>
                </div>
                <div className="card-body">
                  {loadingOrders ? (
                    <p>Loading orders...</p>
                  ) : (
                    <div className="orders-list">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="order-item">
                          <div className="order-info">
                            <div className="order-header">
                              <span className="order-id">{order.id}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="order-route">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{order.from} 	 {order.to}</span>
                            </div>
                            <p className="order-date">{order.date}</p>
                          </div>
                          <div className="order-actions">
                            <p className="order-price">KES {order.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

export default Client;