import React, { useState } from 'react';
import TrackingMap from '../../components/client/TrackingMap';
import OrderTrackingMap from '../../components/client/OrderTrackingMap';
import { trackOrder, getMyOrders } from '../../api';

const Tracking = ({ isActive, onShowPage }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myOrders, setMyOrders] = useState([]);

  // Fetch user's orders on component mount
  React.useEffect(() => {
    if (isActive) {
      fetchMyOrders();
    }
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
    await renderTracking(trackingCode.trim().toUpperCase());
  };

  const handleQuickTrack = async (code) => {
    setTrackingCode(code);
    await renderTracking(code);
  };

  const renderTracking = async (code) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await trackOrder(code);
      
      // Transform the order data to match the expected format
      const transformedData = {
        type: data.serviceType || 'delivery',
        status: data.status,
        statusClass: data.status === 'delivered' ? 'delivered' : data.status === 'in_transit' ? 'transit' : 'pending',
        icon: data.status === 'delivered' ? '✅' : data.status === 'in_transit' ? '🚛' : '📦',
        eta: data.estimatedDelivery || 'Pending',
        etaLabel: 'Estimated Arrival',
        pkg: [
          { l: 'Service', v: data.serviceType || 'Delivery' },
          { l: 'Package', v: data.description || 'Item' },
          { l: 'From', v: data.pickupLocation || 'N/A' },
          { l: 'To', v: data.deliveryLocation || 'N/A' },
          { l: 'Weight', v: data.weight ? `${data.weight}kg` : 'N/A' },
          { l: 'Amount', v: `KES ${data.amount || 0}` },
        ],
        driver: data.driver ? {
          initials: data.driver.fullName?.substring(0, 2).toUpperCase() || 'DR',
          name: data.driver.fullName || 'Driver',
          phone: data.driver.phone || '',
          rating: `⭐ ${data.driver.rating || 4.5}`,
        } : null,
        timeline: data.timeline || [
          { state: 'done', title: 'Order Confirmed', desc: 'Your order has been confirmed.', time: 'Just now' }
        ]
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-tracking">
      <div className="page-header">
        <div className="page-tag">Live Tracking</div>
        <h1 className="page-title">Track Your <span>Shipment</span></h1>
        <p className="page-desc">Enter a tracking code from your booking confirmation to get real-time status updates.</p>
      </div>

      {/* Search */}
      <div className="track-search-card">
        <div className="track-search-label">Enter Tracking Code</div>
        <div className="track-search-row">
          <input 
            type="text" 
            placeholder="e.g. SD-2025-48271 or CG-2025-33901"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
          />
          <button className="track-btn" onClick={handleTrack} disabled={loading}>
            {loading ? 'Tracking...' : 'Track →'}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
        <div className="track-hint">
          Quick track from your orders: 
          {myOrders.length > 0 ? (
            myOrders.slice(0, 3).map((order, idx) => (
              <span key={order._id}>
                <a onClick={() => handleQuickTrack(order._id)}> {order._id}</a>
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
          <div className="track-empty-desc">Enter a tracking code above or click a shipment in your delivery history to see its status.</div>
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
              <div className="track-banner-status">
                {trackingData.statusClass === 'delivered' 
                  ? (trackingData.type === 'relocation' ? 'Completed' : 'Delivered')
                  : trackingData.statusClass === 'transit' ? 'In Transit' : 'Pending'}
              </div>
            </div>
            <div className="track-banner-eta">
              <div className="track-banner-eta-label">{trackingData.etaLabel}</div>
              <div className="track-banner-eta-val">{trackingData.eta}</div>
            </div>
          </div>

          {/* Map - Only render if we have route data */}
          {/* <TrackingMap 
            routeData={ROUTES[trackingCode]} 
            isLive={trackingData.statusClass === 'transit'} 
          /> */}

          <OrderTrackingMap
            fromLabel={trackingData.pkg.find((p) => p.l === 'From')?.v}
            toLabel={trackingData.pkg.find((p) => p.l === 'To')?.v}
          />

          {/* Two columns: timeline + info */}
          <div className="track-cols">
            {/* Timeline */}
            <div className="timeline-card">
              <div className="timeline-card-title">Shipment Timeline</div>
              <div className="timeline">
                {trackingData.timeline && trackingData.timeline.length > 0 ? (
                  trackingData.timeline.map((step, i) => (
                    <div key={i} className={`tl-item ${step.state}`}>
                      <div className="tl-dot-wrap">
                        <div className="tl-dot">
                          {step.state === 'done' ? '✓' : step.state === 'current' ? '→' : i + 1}
                        </div>
                        {i < trackingData.timeline.length - 1 && <div className="tl-line"></div>}
                      </div>
                      <div className="tl-body">
                        <div className="tl-title">{step.title}</div>
                        <div className="tl-desc">{step.desc}</div>
                        <div className="tl-time">{step.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="tl-item">
                    <div className="tl-body">
                      <div className="tl-desc">No timeline information available</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right info stack */}
            <div className="track-info-stack">
              {/* Package details */}
              <div className="track-info-card">
                <div className="track-info-card-title">Package Details</div>
                {trackingData.pkg.map((item, i) => (
                  <div key={i} className="track-info-row">
                    <span className="track-info-lbl">{item.l}</span>
                    <span className="track-info-val">{item.v}</span>
                  </div>
                ))}
              </div>

              {/* Driver */}
              {trackingData.driver && (
                <div className="track-info-card">
                  <div className="track-info-card-title">Your Driver</div>
                  <div className="driver-chip">
                    <div className="driver-avatar">{trackingData.driver.initials}</div>
                    <div>
                      <div className="driver-name">{trackingData.driver.name}</div>
                      <div className="driver-rating">{trackingData.driver.rating}</div>
                      {trackingData.driver.phone && (
                        <div className="driver-phone" style={{ fontSize: '0.85rem', color: '#555', marginTop: 2 }}>
                          📱 {trackingData.driver.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="driver-actions">
                    {trackingData.driver.phone ? (
                      <a href={`tel:${trackingData.driver.phone}`} className="driver-btn" style={{ textDecoration: 'none' }}>
                        📞 Call
                      </a>
                    ) : (
                      <button className="driver-btn" disabled>📞 Call</button>
                    )}
                    {trackingData.driver.phone ? (
                      <a href={`sms:${trackingData.driver.phone}`} className="driver-btn primary" style={{ textDecoration: 'none' }}>
                        💬 Message
                      </a>
                    ) : (
                      <button className="driver-btn primary" disabled>💬 Message</button>
                    )}
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