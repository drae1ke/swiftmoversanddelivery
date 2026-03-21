import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || '';

// Custom icons
const truckIcon = new L.DivIcon({
  html: '<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));animation:pulse 2s infinite;">🚛</div>',
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const pickupIcon = new L.DivIcon({
  html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));">📦</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const dropoffIcon = new L.DivIcon({
  html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));">🏁</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Geocode a place name to coordinates
async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const encoded = encodeURIComponent(address + ', Kenya');
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
    );
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // ignore
  }
  return null;
}

// Fetch ORS route between two points
async function fetchRoute(from, to) {
  if (!ORS_API_KEY || !from || !to) return null;
  try {
    const body = {
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
    };
    const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.features?.[0]?.geometry?.coordinates || [];
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}

// Auto-fit map bounds to all visible points
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    try {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } catch {
      // ignore
    }
  }, [map, JSON.stringify(points)]);
  return null;
}

/**
 * CombinedTrackingMap
 *
 * Props:
 *   driverLocation  – { lat, lng }  (real-time GPS from backend)
 *   pickupAddress   – string
 *   dropoffAddress  – string
 *   driverName      – string (optional)
 *   orderId         – string (optional, for polling interval keying)
 */
const CombinedTrackingMap = ({
  driverLocation,
  pickupAddress,
  dropoffAddress,
  driverName,
  orderId,
}) => {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [driverToPickupRoute, setDriverToPickupRoute] = useState(null);
  const [pickupToDropoffRoute, setPickupToDropoffRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const routeKey = useRef('');

  // Geocode pickup and dropoff once
  useEffect(() => {
    let active = true;
    const run = async () => {
      const [p, d] = await Promise.all([
        geocodeAddress(pickupAddress),
        geocodeAddress(dropoffAddress),
      ]);
      if (active) {
        setPickupCoords(p);
        setDropoffCoords(d);
      }
    };
    if (pickupAddress || dropoffAddress) run();
    return () => { active = false; };
  }, [pickupAddress, dropoffAddress]);

  // Fetch routes when we have coords
  useEffect(() => {
    let active = true;
    const key = `${driverLocation?.lat},${driverLocation?.lng}|${pickupCoords?.lat},${pickupCoords?.lng}|${dropoffCoords?.lat},${dropoffCoords?.lng}`;
    if (key === routeKey.current) return;
    routeKey.current = key;

    const run = async () => {
      setLoadingRoute(true);
      const [r1, r2] = await Promise.all([
        // Driver → Pickup
        driverLocation && pickupCoords
          ? fetchRoute(driverLocation, pickupCoords)
          : Promise.resolve(null),
        // Pickup → Dropoff
        pickupCoords && dropoffCoords
          ? fetchRoute(pickupCoords, dropoffCoords)
          : Promise.resolve(null),
      ]);
      if (active) {
        setDriverToPickupRoute(r1);
        setPickupToDropoffRoute(r2);
        setLoadingRoute(false);
      }
    };

    if (driverLocation || (pickupCoords && dropoffCoords)) run();
    return () => { active = false; };
  }, [driverLocation?.lat, driverLocation?.lng, pickupCoords?.lat, pickupCoords?.lng, dropoffCoords?.lat, dropoffCoords?.lng]);

  // All points we want to fit in view
  const allPoints = useMemo(() => {
    const pts = [];
    if (driverLocation) pts.push([driverLocation.lat, driverLocation.lng]);
    if (pickupCoords) pts.push([pickupCoords.lat, pickupCoords.lng]);
    if (dropoffCoords) pts.push([dropoffCoords.lat, dropoffCoords.lng]);
    return pts;
  }, [driverLocation, pickupCoords, dropoffCoords]);

  const center = allPoints.length > 0 ? allPoints[0] : [-1.2921, 36.8219];

  if (!driverLocation && !pickupCoords && !dropoffCoords) return null;

  return (
    <div className="map-card" style={{ marginBottom: 16 }}>
      <div className="map-header">
        <div className="map-header-left">
          <span className="map-title">Live Tracking Map</span>
          <span className="map-live-dot">
            <span className="map-live-pulse" />
            {driverLocation ? 'Driver Online' : 'Route View'}
          </span>
        </div>
        {loadingRoute && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Loading route…</span>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, padding: '6px 12px 0',
        flexWrap: 'wrap', fontSize: '0.75rem', color: '#475569',
      }}>
        {driverLocation && <span>🚛 {driverName || 'Driver'} (live)</span>}
        {pickupAddress && <span>📦 Pickup: {pickupAddress}</span>}
        {dropoffAddress && <span>🏁 Drop-off: {dropoffAddress}</span>}
      </div>

      <div className="map-body" style={{ height: 340, marginTop: 8 }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {allPoints.length > 0 && <FitBounds points={allPoints} />}

          {/* Driver → Pickup route (dashed blue) */}
          {driverToPickupRoute && driverToPickupRoute.length > 0 && (
            <Polyline
              positions={driverToPickupRoute}
              color="#3b82f6"
              weight={4}
              dashArray="8 6"
              opacity={0.85}
            />
          )}

          {/* Pickup → Dropoff delivery route (solid red) */}
          {pickupToDropoffRoute && pickupToDropoffRoute.length > 0 && (
            <Polyline
              positions={pickupToDropoffRoute}
              color="#dc2626"
              weight={5}
              opacity={0.9}
            />
          )}

          {/* Fallback straight line if no ORS key */}
          {!ORS_API_KEY && pickupCoords && dropoffCoords && (
            <Polyline
              positions={[
                [pickupCoords.lat, pickupCoords.lng],
                [dropoffCoords.lat, dropoffCoords.lng],
              ]}
              color="#dc2626"
              weight={4}
              dashArray="6 4"
              opacity={0.7}
            />
          )}

          {/* Driver marker */}
          {driverLocation && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={truckIcon}
            >
              <Popup>
                <strong>🚛 {driverName || 'Driver'}</strong>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#555' }}>Live location</span>
              </Popup>
            </Marker>
          )}

          {/* Pickup marker */}
          {pickupCoords && (
            <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
              <Popup>
                <strong>📦 Pickup</strong>
                <br />
                <span style={{ fontSize: '0.8rem' }}>{pickupAddress}</span>
              </Popup>
            </Marker>
          )}

          {/* Dropoff marker */}
          {dropoffCoords && (
            <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={dropoffIcon}>
              <Popup>
                <strong>🏁 Drop-off</strong>
                <br />
                <span style={{ fontSize: '0.8rem' }}>{dropoffAddress}</span>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Route legend */}
      <div style={{
        display: 'flex', gap: 16, padding: '8px 12px',
        fontSize: '0.75rem', color: '#475569', flexWrap: 'wrap',
      }}>
        {driverLocation && pickupCoords && (
          <span>
            <span style={{ display: 'inline-block', width: 24, height: 3, background: '#3b82f6', verticalAlign: 'middle', borderRadius: 2, marginRight: 4, borderBottom: '2px dashed #3b82f6' }} />
            Driver → Pickup
          </span>
        )}
        {pickupCoords && dropoffCoords && (
          <span>
            <span style={{ display: 'inline-block', width: 24, height: 3, background: '#dc2626', verticalAlign: 'middle', borderRadius: 2, marginRight: 4 }} />
            Delivery Route
          </span>
        )}
      </div>
    </div>
  );
};

export default CombinedTrackingMap;