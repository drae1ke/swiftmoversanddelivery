import React, { useState } from 'react';
import TrackingMap from '../../components/client/TrackingMap';
import { trackingDB, ROUTES } from '../../data/trackingData';

const Tracking = ({ isActive, onShowPage }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleTrack = () => {
    if (!trackingCode.trim()) return;
    renderTracking(trackingCode.trim().toUpperCase());
  };

  const handleQuickTrack = (code) => {
    setTrackingCode(code);
    renderTracking(code);
  };

  const renderTracking = (code) => {
    const data = trackingDB[code];
    setTrackingData(data);
    setShowResult(!!data);
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
          <button className="track-btn" onClick={handleTrack}>Track →</button>
        </div>
        <div className="track-hint">
          Try a demo: 
          <a onClick={() => handleQuickTrack('SD-2025-48271')}> SD-2025-48271</a> · 
          <a onClick={() => handleQuickTrack('CG-2025-33901')}> CG-2025-33901</a> · 
          <a onClick={() => handleQuickTrack('SD-2025-39104')}> SD-2025-39104</a>
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

          {/* Map */}
          <TrackingMap 
            routeData={ROUTES[trackingCode]} 
            isLive={trackingData.statusClass === 'transit'} 
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
                      {i < trackingData.timeline.length - 1 && <div className="tl-line"></div>}
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
                    </div>
                  </div>
                  <div className="driver-actions">
                    <button className="driver-btn" onClick={() => alert('📞 Calling driver…')}>
                      📞 Call
                    </button>
                    <button className="driver-btn primary" onClick={() => alert('💬 Opening chat…')}>
                      💬 Message
                    </button>
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