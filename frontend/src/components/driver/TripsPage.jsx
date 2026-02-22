import React from 'react';
import { FaSearch, FaTruck, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function TripsPage({ 
  active, filtTrips, tripSearch, setTripSearch, 
  tripFilter, setTripFilter, setPanel 
}) {
  if (!active) return null;

  const filters = ['all', 'active', 'pending', 'completed', 'cancelled'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FaTruck />;
      case 'pending': return <FaClock />;
      case 'completed': return <FaCheckCircle />;
      case 'cancelled': return <FaTimesCircle />;
      default: return null;
    }
  };

  const getIconClass = (status) => {
    if (status === 'active') return 'active-bg';
    if (status === 'pending') return 'pending-bg';
    return 'done-bg';
  };

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Operations</div>
        <h1 className="dp-page-title">My <span>Trips</span></h1>
        <p className="dp-page-desc">View all assigned trips, update statuses, and track deliveries.</p>
      </div>
      <div className="dp-toolbar">
        <div className="dp-search-wrap">
          <span className="dp-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search trips, routes, customers…" 
            value={tripSearch} 
            onChange={e => setTripSearch(e.target.value)} 
          />
        </div>
        <div className="dp-filter-tabs">
          {filters.map(f => (
            <button 
              key={f} 
              className={`dp-tab ${tripFilter === f ? 'active' : ''}`} 
              onClick={() => setTripFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="dp-trip-list">
        {filtTrips.map(t => (
          <div key={t.id} className="dp-trip-card" onClick={() => setPanel({ open: true, trip: t })}>
            <div className="dp-trip-head">
              <div className={`dp-trip-icon ${getIconClass(t.status)}`}>
                {getStatusIcon(t.status)}
              </div>
              <div>
                <div className="dp-trip-id">{t.tripId}</div>
                <div className="dp-trip-meta">{t.customer} · {t.date} · {t.time}</div>
              </div>
              <div className="dp-trip-status">
                <span className={`dp-pill dp-pill-${t.status}`}>{t.status}</span>
              </div>
            </div>
            <div className="dp-trip-route">
              <div className="dp-route-row">
                <div className="dp-route-dot from" />
                <span className="dp-route-label">From</span>
                <span className="dp-route-val">{t.from}</span>
              </div>
              <div className="dp-route-line" style={{ marginLeft: 3.5 }} />
              <div className="dp-route-row">
                <div className="dp-route-dot to" />
                <span className="dp-route-label">To</span>
                <span className="dp-route-val">{t.to}</span>
              </div>
            </div>
            <div className="dp-trip-foot">
              <div>
                <span style={{ fontSize: '.77rem', color: 'var(--muted)' }}>Cargo: </span>
                <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{t.cargo}</span>
              </div>
              <span className="dp-trip-amount">KES {t.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {filtTrips.length === 0 && (
          <div className="dp-empty">No trips match your filter.</div>
        )}
      </div>
    </div>
  );
}