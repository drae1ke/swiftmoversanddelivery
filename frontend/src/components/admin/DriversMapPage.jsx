import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { getAdminDriverLocations, getAdminOrders } from '../../api';
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
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || '';

const VEHICLE_ICONS = {
  bicycle: '🚲',
  bike: '🏍️',
  car: '🚗',
  van: '🚐',
  lorry: '🚛',
};

// Build driver DivIcon
function makeDriverIcon(vehicleType, isSelected = false) {
  const emoji = VEHICLE_ICONS[vehicleType] || '🚗';
  const size = isSelected ? 40 : 32;
  const shadow = isSelected
    ? '0 0 0 3px #3b82f6, 0 2px 8px rgba(0,0,0,.4)'
    : '0 2px 4px rgba(0,0,0,.3)';
  return new L.DivIcon({
    html: `<div style="font-size:${size * 0.75}px;line-height:1;filter:drop-shadow(${shadow});">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const pickupIcon = new L.DivIcon({
  html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3));">📦</div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const dropoffIcon = new L.DivIcon({
  html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3));">🏁</div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// Geocode a place to {lat,lng}
async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const encoded = encodeURIComponent(address + ', Kenya');
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
    );
    const data = await res.json();
    if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* ignore */ }
  return null;
}

// Fetch ORS driving route
async function fetchRoute(from, to) {
  if (!ORS_API_KEY || !from || !to) return null;
  try {
    const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: ORS_API_KEY },
      body: JSON.stringify({ coordinates: [[from.lng, from.lat], [to.lng, to.lat]] }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.features?.[0]?.geometry?.coordinates || [];
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch { return null; }
}

// Auto-fit bounds
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    try {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 14 });
    } catch { /* ignore */ }
  }, [map, JSON.stringify(points)]);
  return null;
}

// Route overlay for a selected driver (shows their current order route)
function DriverRouteOverlay({ driver, ordersByDriver }) {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [driverToPickup, setDriverToPickup] = useState(null);

  const order = ordersByDriver[driver.driverId];

  useEffect(() => {
    if (!order) return;
    let active = true;
    const run = async () => {
      const [p, d] = await Promise.all([
        geocodeAddress(order.pickupAddress),
        geocodeAddress(order.dropoffAddress),
      ]);
      if (!active) return;
      setPickupCoords(p);
      setDropoffCoords(d);

      const driverPos = driver.coordinates
        ? { lat: driver.coordinates[1], lng: driver.coordinates[0] }
        : null;

      const [r1, r2] = await Promise.all([
        driverPos && p ? fetchRoute(driverPos, p) : Promise.resolve(null),
        p && d ? fetchRoute(p, d) : Promise.resolve(null),
      ]);
      if (!active) return;
      setDriverToPickup(r1);
      setRoute(r2);
    };
    run();
    return () => { active = false; };
  }, [driver.driverId, order?.pickupAddress, order?.dropoffAddress]);

  return (
    <>
      {/* Driver → Pickup (dashed blue) */}
      {driverToPickup && driverToPickup.length > 0 && (
        <Polyline positions={driverToPickup} color="#3b82f6" weight={3} dashArray="8 5" opacity={0.9} />
      )}
      {/* Pickup → Dropoff (solid red) */}
      {route && route.length > 0 && (
        <Polyline positions={route} color="#dc2626" weight={4} opacity={0.85} />
      )}
      {/* Fallback straight lines if no ORS */}
      {!ORS_API_KEY && pickupCoords && dropoffCoords && (
        <Polyline
          positions={[[pickupCoords.lat, pickupCoords.lng], [dropoffCoords.lat, dropoffCoords.lng]]}
          color="#dc2626" weight={3} dashArray="5 4" opacity={0.7}
        />
      )}
      {pickupCoords && (
        <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
          <Popup>
            <strong>📦 Pickup</strong><br />
            <span style={{ fontSize: '0.8rem' }}>{order?.pickupAddress}</span>
          </Popup>
        </Marker>
      )}
      {dropoffCoords && (
        <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={dropoffIcon}>
          <Popup>
            <strong>🏁 Drop-off</strong><br />
            <span style={{ fontSize: '0.8rem' }}>{order?.dropoffAddress}</span>
          </Popup>
        </Marker>
      )}
    </>
  );
}

export default function DriversMapPage({ active }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [ordersByDriver, setOrdersByDriver] = useState({});
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

  // Fetch active orders and map driverId → order
  const fetchOrderRoutes = async () => {
    try {
      const res = await getAdminOrders(1, 100);
      const orders = res?.orders || res || [];
      const map = {};
      orders.forEach((o) => {
        if (o.driver && ['assigned', 'in-transit', 'active'].includes(o.status)) {
          const driverId = o.driver?._id || o.driver?.id || o.driverId;
          if (driverId) map[driverId] = o;
        }
      });
      setOrdersByDriver(map);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    if (!active) return;
    fetchLocations();
    fetchOrderRoutes();
    intervalRef.current = setInterval(() => {
      fetchLocations();
      fetchOrderRoutes();
    }, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  if (!active) return null;

  // All visible points for fit
  const allPoints = [];
  if (selectedDriver) {
    const [lng, lat] = selectedDriver.coordinates;
    allPoints.push([lat, lng]);
  }

  return (
    <div className="ap-page active" id="page-driversmap">
      <div className="ap-page-header">
        <h2>Drivers Map</h2>
        <p style={{ color: 'var(--text-s)', fontSize: '0.9rem', margin: '4px 0 0' }}>
          {drivers.length} driver{drivers.length !== 1 ? 's' : ''} online — click a driver to see their route
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 20, padding: '8px 0 12px',
        fontSize: '0.8rem', color: '#475569', flexWrap: 'wrap',
      }}>
        <span>
          <span style={{ display: 'inline-block', width: 28, height: 3, background: '#3b82f6', verticalAlign: 'middle', borderRadius: 2, marginRight: 4, borderBottom: '2px dashed #3b82f6' }} />
          Driver → Pickup
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 28, height: 3, background: '#dc2626', verticalAlign: 'middle', borderRadius: 2, marginRight: 4 }} />
          Delivery Route
        </span>
        {selectedDriver && (
          <span style={{ marginLeft: 'auto', color: '#3b82f6', cursor: 'pointer' }}
            onClick={() => setSelectedDriver(null)}>
            ✕ Clear selection
          </span>
        )}
      </div>

      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-s)' }}>
          Loading driver locations…
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 8, color: '#dc2626', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {!loading && (
        <div style={{ borderRadius: 16, overflow: 'hidden', height: 540, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
          <MapContainer
            center={NAIROBI_CENTER}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Show route overlay for selected driver */}
            {selectedDriver && (
              <DriverRouteOverlay
                driver={selectedDriver}
                ordersByDriver={ordersByDriver}
              />
            )}

            {/* Driver markers */}
            {drivers.map((driver) => {
              if (!driver.coordinates || driver.coordinates.length < 2) return null;
              const [lng, lat] = driver.coordinates;
              const isSelected = selectedDriver?.driverId === driver.driverId;
              const hasOrder = !!ordersByDriver[driver.driverId];

              return (
                <Marker
                  key={driver.driverId}
                  position={[lat, lng]}
                  icon={makeDriverIcon(driver.vehicleType, isSelected)}
                  eventHandlers={{ click: () => setSelectedDriver(isSelected ? null : driver) }}
                >
                  <Popup>
                    <div style={{ minWidth: 180, lineHeight: 1.7 }}>
                      <strong style={{ fontSize: '1rem' }}>
                        {VEHICLE_ICONS[driver.vehicleType] || '🚗'} {driver.fullName}
                      </strong>
                      <br />
                      {driver.phone && (
                        <><a href={`tel:${driver.phone}`}>📞 {driver.phone}</a><br /></>
                      )}
                      <span style={{ fontSize: '0.8rem', color: '#555' }}>
                        {driver.vehicleType} · ⭐ {driver.rating?.toFixed(1) || '—'} · {driver.totalTrips || 0} trips
                      </span>
                      <br />
                      <span style={{
                        display: 'inline-block', marginTop: 4, padding: '2px 8px',
                        borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                        background: hasOrder ? '#dcfce7' : '#f1f5f9',
                        color: hasOrder ? '#166534' : '#64748b',
                      }}>
                        {hasOrder ? '🟢 On delivery' : '🟡 Available'}
                      </span>
                      <br />
                      <button
                        onClick={() => setSelectedDriver(isSelected ? null : driver)}
                        style={{
                          marginTop: 6, padding: '4px 12px', borderRadius: 6,
                          background: isSelected ? '#fee2e2' : '#3b82f6',
                          color: isSelected ? '#dc2626' : '#fff',
                          border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                        }}
                      >
                        {isSelected ? '✕ Hide Route' : '📍 Show Route'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Driver list below map */}
      {!loading && drivers.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-m)', marginBottom: 8 }}>
            Online Drivers
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {drivers.map((driver) => {
              const hasOrder = !!ordersByDriver[driver.driverId];
              const isSelected = selectedDriver?.driverId === driver.driverId;
              return (
                <div
                  key={driver.driverId}
                  onClick={() => setSelectedDriver(isSelected ? null : driver)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : 'var(--card)',
                    border: `1.5px solid ${isSelected ? '#3b82f6' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{VEHICLE_ICONS[driver.vehicleType] || '🚗'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {driver.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                      {driver.vehicleType} · ⭐ {driver.rating?.toFixed(1) || '—'}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                    background: hasOrder ? '#dcfce7' : '#f1f5f9',
                    color: hasOrder ? '#166534' : '#64748b',
                    flexShrink: 0,
                  }}>
                    {hasOrder ? 'On Delivery' : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && drivers.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-s)' }}>
          No drivers are currently online.
        </div>
      )}
    </div>
  );
}