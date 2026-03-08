import React, { useState, useRef, useEffect } from 'react';

/**
 * GeoAddressInput — a drop-in address field.
 *
 * Props:
 *  label         - field label string
 *  placeholder   - input placeholder
 *  value         - controlled string value
 *  onChange(val) - called with the human-readable address string
 *  allowGPS      - show "Use my location" button (default true)
 *  style         - extra style on the wrapper div
 */
const GeoAddressInput = ({ label, placeholder, value, onChange, allowGPS = true, style }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 4) { setSuggestions([]); setShowDrop(false); return; }
    setLoadingSugg(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=ke&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowDrop(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSugg(false);
    }
  };

  const handleInput = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 400);
  };

  const handleSelect = (item) => {
    onChange(item.display_name);
    setSuggestions([]);
    setShowDrop(false);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.display_name || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
          onChange(addr);
          setSuggestions([]);
          setShowDrop(false);
        } catch {
          onChange(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        } finally {
          setLoadingGPS(false);
        }
      },
      (err) => {
        setLoadingGPS(false);
        alert('Could not get your location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="field" style={style} ref={wrapperRef}>
      {label && <label>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder={placeholder || 'Enter address'}
          value={value}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          autoComplete="off"
          style={{ flex: 1 }}
        />
        {allowGPS && (
          <button
            type="button"
            title="Use my current location"
            disabled={loadingGPS}
            onClick={handleGPS}
            style={{
              flexShrink: 0,
              padding: '0 12px',
              border: '1.5px solid #DC2626',
              borderRadius: 8,
              background: loadingGPS ? '#fee2e2' : '#fff',
              color: '#DC2626',
              cursor: loadingGPS ? 'wait' : 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            {loadingGPS ? '⏳' : '📍'}
          </button>
        )}

        {/* Suggestions dropdown */}
        {showDrop && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: allowGPS ? 52 : 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            zIndex: 9999,
            maxHeight: 220,
            overflowY: 'auto',
            marginTop: 4,
          }}>
            {loadingSugg && (
              <div style={{ padding: '10px 14px', color: '#64748b', fontSize: '.8rem' }}>Searching…</div>
            )}
            {suggestions.map((s) => (
              <div
                key={s.place_id}
                onMouseDown={() => handleSelect(s)}
                style={{
                  padding: '9px 14px',
                  fontSize: '.82rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#1e293b',
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ marginRight: 6 }}>📍</span>
                {s.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeoAddressInput;