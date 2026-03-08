import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import OrderTrackingMap from '../../components/client/OrderTrackingMap';
import { trackOrder, getMyOrders } from '../../api';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.DivIcon({
  html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">🚛</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// A small live map that shows driver's current GPS position
const DriverLiveMap = ({ driverLocation, pickupAddress, dropoffAddress }) => {
  if (!driverLocation) return null;
  const { lat, lng } = driverLocation;
  return (
    <div className="map-card" style={{ marginBottom: 16 }}>
      <div className="map-header">
        <div className="map-header-left">
          <span className="map-title">Driver Live Location</span>
          <span className="map-live-dot">
            <span className="map-live-pulse" />
            Live
          </span>
        </div>
      </div>
      <div className="map-body" style={{ height: 240 }}>
        <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={truckIcon}>
            <Popup>🚛 Driver is here</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

const Tracking = ({ isActive, onShowPage }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myOrders, setMyOrders] = useState([]);

  React.useEffect(() => {
    if (isActive) fetchMyOrders();
  }, [isActive]);

  const fetchMyOrders = async () => {
    try {
      const data = await getMyOrders();
      setMyOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleTrack = async () => {
    if (!trackingCode.trim()) return;
    await renderTracking(trackingCode.trim());
  };

  const handleQuickTrack = async (code) => {
    setTrackingCode(code);
    await renderTracking(code);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleTrack();
  };

  const renderTracking = async (code) => {
    try {
      setLoading(true);
      setError(null);
      const data = await trackOrder(code);

      // Build status info
      const statusMap = {
        delivered: { cls: 'delivered', icon: '✅', label: 'Delivered' },
        'in-transit': { cls: 'transit', icon: '🚛', label: 'In Transit' },
        assigned: { cls: 'transit', icon: '🔄', label: 'Assigned' },
        pending: { cls: 'pending', icon: '📦', label: 'Pending' },
      };
      const st = statusMap[data.status] || { cls: 'pending', icon: '📦', label: data.status };

      // Driver location from backend (if present)
      let driverLocation = null;
      if (data.driver?.location?.coordinates) {
        const [lng, lat] = data.driver.location.coordinates;
        if (lat && lng) driverLocation = { lat, lng };
      }

      const transformedData = {
        type: data.serviceType || 'delivery',
        status: data.status,
        statusClass: st.cls,
        icon: st.icon,
        statusLabel: st.label,
        eta: data.estimatedDelivery || 'Pending',
        etaLabel: 'Estimated Arrival',
        // Full delivery data
        pkg: [
          { l: 'Service', v: data.serviceType || 'Delivery' },
          { l: 'From', v: data.pickupAddress || 'N/A' },
          { l: 'To', v: data.dropoffAddress || 'N/A' },
          { l: 'Recipient', v: data.recipientName || '—' },
          { l: 'Recipient Phone', v: data.recipientPhone || '—' },
          { l: 'Weight', v: data.packageWeightKg ? `${data.packageWeightKg} kg` : 'N/A' },
          { l: 'Vehicle', v: data.vehicleType || '—' },
          { l: 'Amount', v: `KES ${(data.priceKes || data.amount || 0).toLocaleString()}` },
          { l: 'Distance', v: data.distanceKm ? `${data.distanceKm} km` : '—' },
          { l: 'Placed', v: data.createdAt ? new Date(data.createdAt).toLocaleString() : '—' },
          ...(data.deliveredAt ? [{ l: 'Delivered', v: new Date(data.deliveredAt).toLocaleString() }] : []),
        ],
        driver: data.driver ? {
          initials: (data.driver.user?.fullName || data.driver.fullName || 'DR').substring(0, 2).toUpperCase(),
          name: data.driver.user?.fullName || data.driver.fullName || 'Driver',
          phone: data.driver.user?.phone || data.driver.phone || '',
          vehicle: data.driver.vehicleType || '',
          plate: data.driver.plateNumber || '',
          rating: `⭐ ${(data.driver.rating || 4.5).toFixed(1)}`,
          location: driverLocation,
        } : null,
        timeline: data.timeline || buildTimeline(data),
        rawPickup: data.pickupAddress,
        rawDropoff: data.dropoffAddress,
      };

      setTrackingData(transformedData);
      setShowResult(true);
    } catch (err) {
      setError(err.message || 'Order not found');
      setTrackingData(null);
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  // Build a simple timeline from order status if backend doesn't provide one
  const buildTimeline = (data) => {
    const steps = [
      { key: 'pending', title: 'Order Placed', desc: 'Your order was received.' },
      { key: 'assigned', title: 'Driver Assigned', desc: 'A driver has been assigned.' },
      { key: 'in-transit', title: 'In Transit', desc: 'Your shipment is on the way.' },
      { key: 'delivered', title: 'Delivered', desc: 'Shipment delivered successfully.' },
    ];
    const order = ['pending', 'assigned', 'in-transit', 'delivered'];
    const idx = order.indexOf(data.status);
    return steps.map((s, i) => ({
      ...s,
      state: i < idx ? 'done' : i === idx ? 'current' : 'upcoming',
      time: i === idx ? 'Now' : i < idx ? '—' : '',
    }));
  };

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-tracking">
      <div className="page-header">
        <div className="page-tag">Live Tracking</div>
        <h1 className="page-title">Track Your <span>Shipment</span></h1>
        <p className="page-desc">Enter your order ID or tracking code to see real-time status, delivery data, and driver location.</p>
      </div>

      {/* Search */}
      <div className="track-search-card">
        <div className="track-search-label">Enter Tracking Code</div>
        <div className="track-search-row">
          <input
            type="text"
            placeholder="e.g. 6849abc123... or last 8 chars"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="track-btn" onClick={handleTrack} disabled={loading}>
            {loading ? 'Tracking...' : 'Track →'}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: '0.5rem', fontSize: '.85rem' }}>{error}</div>}
        <div className="track-hint">
          Quick track from your orders:{' '}
          {myOrders.length > 0 ? (
            myOrders.slice(0, 3).map((order, idx) => (
              <span key={order._id}>
                <a style={{ cursor: 'pointer', color: '#DC2626' }} onClick={() => handleQuickTrack(order._id)}>
                  {order._id?.slice(-8)?.toUpperCase()}
                </a>
                {idx < Math.min(2, myOrders.length - 1) && ' · '}
              </span>
            ))
          ) : (
            <span> No orders yet</span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!showResult && (
        <div className="track-empty">
          <div className="track-empty-icon">📦</div>
          <div className="track-empty-title">No shipment loaded</div>
          <div className="track-empty-desc">Enter a tracking code above to see full delivery data, driver info, and live location.</div>
        </div>
      )}

      {/* Result panel */}
      {showResult && trackingData && (
        <div className="track-result" style={{ display: 'block' }}>
          {/* Status banner */}
          <div className={`track-banner ${trackingData.statusClass}`}>
            <div className="track-banner-icon">{trackingData.icon}</div>
            <div>
              <div className="track-banner-code">{trackingCode}</div>
              <div className="track-banner-status">{trackingData.statusLabel}</div>
            </div>
            <div className="track-banner-eta">
              <div className="track-banner-eta-label">{trackingData.etaLabel}</div>
              <div className="track-banner-eta-val">{trackingData.eta}</div>
            </div>
          </div>

          {/* Live driver location map (when driver has GPS coordinates) */}
          {trackingData.driver?.location && (
            <DriverLiveMap
              driverLocation={trackingData.driver.location}
              pickupAddress={trackingData.rawPickup}
              dropoffAddress={trackingData.rawDropoff}
            />
          )}

          {/* Route map (OpenRouteService) */}
          <OrderTrackingMap
            fromLabel={trackingData.rawPickup}
            toLabel={trackingData.rawDropoff}
          />

          {/* Two columns: timeline + info */}
          <div className="track-cols">
            {/* Timeline */}
            <div className="timeline-card">
              <div className="timeline-card-title">Shipment Timeline</div>
              <div className="timeline">
                {trackingData.timeline.map((step, i) => (
                  <div key={i} className={`tl-item ${step.state}`}>
                    <div className="tl-dot-wrap">
                      <div className="tl-dot">
                        {step.state === 'done' ? '✓' : step.state === 'current' ? '→' : i + 1}
                      </div>
                      {i < trackingData.timeline.length - 1 && <div className="tl-line" />}
                    </div>
                    <div className="tl-body">
                      <div className="tl-title">{step.title}</div>
                      <div className="tl-desc">{step.desc}</div>
                      <div className="tl-time">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right info stack */}
            <div className="track-info-stack">
              {/* Full delivery data card */}
              <div className="track-info-card">
                <div className="track-info-card-title">Delivery Details</div>
                {trackingData.pkg.map((item, i) => (
                  <div key={i} className="track-info-row">
                    <span className="track-info-lbl">{item.l}</span>
                    <span className="track-info-val">{item.v}</span>
                  </div>
                ))}
              </div>

              {/* Driver card */}
              {trackingData.driver && (
                <div className="track-info-card">
                  <div className="track-info-card-title">Your Driver</div>
                  <div className="driver-chip">
                    <div className="driver-avatar">{trackingData.driver.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div className="driver-name">{trackingData.driver.name}</div>
                      <div className="driver-rating">{trackingData.driver.rating}</div>
                      {trackingData.driver.vehicle && (
                        <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: 2 }}>
                          🚗 {trackingData.driver.vehicle}{trackingData.driver.plate ? ` · ${trackingData.driver.plate}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Call / Message buttons */}
                  <div className="driver-actions" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    {trackingData.driver.phone ? (
                      <a
                        href={`tel:${trackingData.driver.phone}`}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 6, padding: '10px 0', background: '#DC2626', color: '#fff',
                          borderRadius: 8, fontWeight: 700, fontSize: '.85rem', textDecoration: 'none',
                        }}
                      >
                        📞 Call Driver
                      </a>
                    ) : (
                      <button disabled style={{ flex: 1, padding: '10px 0', borderRadius: 8, opacity: .4 }}>
                        📞 No Phone
                      </button>
                    )}
                    {trackingData.driver.phone ? (
                      <a
                        href={`sms:${trackingData.driver.phone}`}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 6, padding: '10px 0', background: '#f1f5f9', color: '#1e293b',
                          border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 700,
                          fontSize: '.85rem', textDecoration: 'none',
                        }}
                      >
                        💬 Message
                      </a>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;