import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAdminDriverLocations } from '../../api';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NAIROBI_CENTER = [-1.2921, 36.8219];
const POLL_INTERVAL = 10000;

const vehicleIcons = {
  bicycle: '🚲',
  bike: '🏍️',
  car: '🚗',
  van: '🚐',
  lorry: '🚛',
};

export default function DriversMapPage({ active }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchLocations = async () => {
    try {
      const data = await getAdminDriverLocations();
      setDrivers(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load driver locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active) return;

    fetchLocations();
    intervalRef.current = setInterval(fetchLocations, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="ap-page active" id="page-driversmap">
      <div className="ap-page-header">
        <h2>Drivers Map</h2>
        <p style={{ color: 'var(--text-s)', fontSize: '0.9rem', margin: '4px 0 0' }}>
          {drivers.length} driver{drivers.length !== 1 ? 's' : ''} online · Updates every 10s
        </p>
      </div>

      {error && (
        <div style={{ color: '#e53e3e', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ height: 'calc(100vh - 200px)', minHeight: 400, borderRadius: 'var(--r, 8px)', overflow: 'hidden', border: '1px solid var(--border-l, #e2e8f0)' }}>
        <MapContainer
          center={NAIROBI_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {drivers.map((driver) => {
            const [lng, lat] = driver.coordinates || [0, 0];
            if (!lat && !lng) return null;
            return (
              <Marker key={driver.driverId} position={[lat, lng]}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                      {vehicleIcons[driver.vehicleType] || '🚗'} {driver.fullName}
                    </div>
                    {driver.phone && (
                      <div style={{ marginBottom: 2 }}>
                        📱 <a href={`tel:${driver.phone}`} style={{ color: '#3182ce' }}>{driver.phone}</a>
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {driver.vehicleType?.charAt(0).toUpperCase() + driver.vehicleType?.slice(1) || 'Unknown'}
                      {driver.plateNumber ? ` · ${driver.plateNumber}` : ''}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 2 }}>
                      ⭐ {driver.rating?.toFixed(1) || '—'} · {driver.totalTrips || 0} trips
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
