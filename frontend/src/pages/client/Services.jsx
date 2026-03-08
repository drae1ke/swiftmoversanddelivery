import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAdminDriverLocations } from '../../api';

// Fix default Leaflet marker icons when bundled with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const VEHICLE_ICONS = { bike: '🏍️', car: '🚗', van: '🚐', lorry: '🚛', bicycle: '🚲' };
const NAIROBI = [-1.2921, 36.8219];

const LiveDriversMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const data = await getAdminDriverLocations();
      setDrivers(Array.isArray(data) ? data.filter(d => d.coordinates?.[0] && d.coordinates?.[1]) : []);
    } catch {
      // silently fail — map still renders without markers
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="map-card" style={{ marginBottom: 24 }}>
      <div className="map-header">
        <div className="map-header-left">
          <span className="map-title">Live Drivers</span>
          <span className="map-live-dot">
            <span className="map-live-pulse" />
            {loading ? 'Loading…' : `${drivers.length} online`}
          </span>
        </div>
        <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>Updates every 15s</span>
      </div>
      <div className="map-body" style={{ height: 280 }}>
        <MapContainer center={NAIROBI} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {drivers.map((d) => {
            const [lng, lat] = d.coordinates;
            return (
              <Marker key={d.driverId} position={[lat, lng]}>
                <Popup>
                  <div style={{ minWidth: 150, lineHeight: 1.6 }}>
                    <strong>{VEHICLE_ICONS[d.vehicleType] || '🚗'} {d.fullName}</strong><br />
                    {d.phone && <><a href={`tel:${d.phone}`}>📞 {d.phone}</a><br /></>}
                    <span style={{ fontSize: '.8rem', color: '#555' }}>
                      {d.vehicleType} · ⭐ {d.rating?.toFixed(1) || '—'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

const Services = ({ isActive, onShowPage, userName }) => {
  const services = [
    { id: 'delivery', icon: '📦', title: 'Send a Package', desc: 'Same-day or standard delivery across Kenya.', arrow: 'Request Delivery' },
    { id: 'relocation', icon: '🏠', title: 'Move Home or Office', desc: 'Full relocation service — packing, loading, transport.', arrow: 'Plan Relocation' },
    { id: 'cargo', icon: '🚛', title: 'Ship Cargo', desc: 'Heavy goods, bulk orders, commercial freight.', arrow: 'Book Cargo' },
    { id: 'storage', icon: '🏢', title: 'Find Storage Space', desc: 'Browse secure, insured storage units across Kenya.', arrow: 'Browse Spaces' },
  ];

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-services">
      <div className="page-header">
        <div className="page-tag">Welcome back, {userName || 'there'}</div>
        <h1 className="page-title">What would you like<br /><span>to do today?</span></h1>
        <p className="page-desc">Choose a service below. Drivers near you are shown on the map in real time.</p>
      </div>

      {/* Live drivers map */}
      <LiveDriversMap />

      <div className="service-grid">
        {services.map(service => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => onShowPage(service.id)}
          >
            <div className="service-card-icon">{service.icon}</div>
            <div className="service-card-title">{service.title}</div>
            <div className="service-card-desc">{service.desc}</div>
            <div className="service-card-arrow">{service.arrow} <span>→</span></div>
          </div>
        ))}

        <div
          className="service-card"
          onClick={() => onShowPage('tracking')}
          style={{ gridColumn: '1/-1', flexDirection: 'row', alignItems: 'center', gap: '24px' }}
        >
          <div className="service-card-icon" style={{ marginBottom: 0, fontSize: '2rem' }}>📍</div>
          <div style={{ flex: 1 }}>
            <div className="service-card-title">Track a Shipment</div>
            <div className="service-card-desc" style={{ maxWidth: '480px' }}>
              Enter a tracking code to see live status, timeline, route details, and driver info.
            </div>
          </div>
          <div className="service-card-arrow" style={{ marginTop: 0, flexShrink: 0 }}>
            Track Now <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;