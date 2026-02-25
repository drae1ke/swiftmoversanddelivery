import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const fitRouteBounds = (coordinates) => {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;
    const lats = coordinates.map((c) => c[0]);
    const lngs = coordinates.map((c) => c[1]);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);

    map.fitBounds(
      [
        [south, west],
        [north, east],
      ],
      { padding: [40, 40] },
    );
  }, [coordinates, map]);

  return null;
};

async function geocodePlace(place) {
  if (!ORS_API_KEY || !place) return null;

  const url = `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(
    ORS_API_KEY,
  )}&text=${encodeURIComponent(place)}&size=1`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  // ORS returns [lon, lat]
  return { lat: coords[1], lng: coords[0] };
}

async function fetchRoute(fromLabel, toLabel) {
  if (!ORS_API_KEY || !fromLabel || !toLabel) {
    return { coords: [], from: null, to: null };
  }

  const [from, to] = await Promise.all([geocodePlace(fromLabel), geocodePlace(toLabel)]);
  if (!from || !to) {
    return { coords: [], from, to };
  }

  const start = `${from.lng},${from.lat}`;
  const end = `${to.lng},${to.lat}`;
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${encodeURIComponent(
    ORS_API_KEY,
  )}&start=${start}&end=${end}`;

  const res = await fetch(url);
  if (!res.ok) {
    return { coords: [], from, to };
  }
  const data = await res.json();
  const geometry = data?.features?.[0]?.geometry;
  const rawCoords = geometry?.coordinates || [];
  // Convert [lon, lat] → [lat, lon] for Leaflet
  const coords = rawCoords.map((c) => [c[1], c[0]]);

  return { coords, from, to };
}

const OrderTrackingMap = ({ fromLabel, toLabel }) => {
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!fromLabel || !toLabel || !ORS_API_KEY) {
        return;
      }
      setLoading(true);
      setError('');
      try {
        const result = await fetchRoute(fromLabel, toLabel);
        if (!active) return;
        if (!result.coords || result.coords.length === 0) {
          setError('We could not draw the route for this shipment.');
        }
        setRoute(result);
      } catch (e) {
        if (active) {
          setError('There was a problem loading the live route.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [fromLabel, toLabel]);

  // Hide entirely if no key configured so the rest of the page still works
  if (!ORS_API_KEY) {
    return null;
  }

  if (!fromLabel || !toLabel) {
    return null;
  }

  const center = useMemo(() => {
    if (route?.coords && route.coords.length > 0) {
      return route.coords[Math.floor(route.coords.length / 2)];
    }
    return [-0.0236, 37.9062]; // Rough center of Kenya fallback
  }, [route]);

  return (
    <div className="map-card">
      <div className="map-header">
        <div className="map-header-left">
          <span className="map-title">Route on Live Map</span>
          <span className="map-live-dot">
            <span className="map-live-pulse"></span>
            OpenRouteService
          </span>
        </div>
        <div className="map-route-label">
          {fromLabel} → {toLabel}
        </div>
      </div>

      <div className="map-body" style={{ height: 320 }}>
        {loading && (
          <div className="tracking-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading live route…</p>
          </div>
        )}

        {!loading && (
          <MapContainer
            center={center}
            zoom={7}
            style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {route?.coords && route.coords.length > 0 && (
              <>
                <fitRouteBounds coordinates={route.coords} />
                <Polyline positions={route.coords} color="#dd3333" weight={5} />
              </>
            )}

            {route?.from && (
              <Marker position={[route.from.lat, route.from.lng]}>
                <Popup>Pickup: {fromLabel}</Popup>
              </Marker>
            )}

            {route?.to && (
              <Marker position={[route.to.lat, route.to.lng]}>
                <Popup>Drop-off: {toLabel}</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {error && (
        <div className="track-empty-desc" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default OrderTrackingMap;

