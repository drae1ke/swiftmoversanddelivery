import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function TripsPage({ 
  active, filtTrips, tripSearch, setTripSearch, 
  tripFilter, setTripFilter, setPanel 
}) {
  if (!active) return null;

  const filters = ['all', 'active', 'pending', 'completed', 'cancelled'];

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">Operations</div>
        <h1 className="ap-page-title">All <span>Trips</span></h1>
        <p className="ap-page-desc">Monitor all dispatch activity across all drivers.</p>
      </div>
      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search by trip ID or driver…" 
            value={tripSearch} 
            onChange={e => setTripSearch(e.target.value)} 
          />
        </div>
        <div className="ap-filter-tabs">
          {filters.map(f => (
            <button 
              key={f} 
              className={`ap-tab ${tripFilter === f ? 'active' : ''}`} 
              onClick={() => setTripFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtTrips.map(t => (
                <tr key={t.id} onClick={() => setPanel({ open: true, type: 'trip', data: t })}>
                  <td><div className="ap-td-name">{t.tripId}</div></td>
                  <td style={{ fontSize: '.84rem' }}>{t.driver}</td>
                  <td style={{ fontSize: '.78rem', color: 'var(--muted)', maxWidth: 180 }}>
                    {t.from} → {t.to}
                  </td>
                  <td style={{ fontFamily: 'var(--font-d)', fontSize: '.9rem' }}>
                    KES {t.amount.toLocaleString()}
                  </td>
                  <td><span className={`ap-pill ap-pill-${t.status}`}>{t.status}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{t.date}</td>
                </tr>
              ))}
              {filtTrips.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="ap-empty">No trips match your filter.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}