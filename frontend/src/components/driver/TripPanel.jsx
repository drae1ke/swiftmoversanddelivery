import React from 'react';
import { FaTimes, FaPlay, FaCheck, FaBan } from 'react-icons/fa';

export default function TripPanel({ panel, setPanel, trips, updateTripStatus }) {
  if (!panel.open || !panel.trip) return null;

  const t = trips.find(x => x.id === panel.trip.id) || panel.trip;

  return (
    <>
      <div className={`dp-overlay ${panel.open ? 'open' : ''}`} onClick={() => setPanel(p => ({ ...p, open: false }))} />
      <div className={`dp-panel ${panel.open ? 'open' : ''}`}>
        <div className="dp-panel-head">
          <div className="dp-panel-title">{t.tripId}</div>
          <button className="dp-panel-close" onClick={() => setPanel(p => ({ ...p, open: false }))}>
            <FaTimes />
          </button>
        </div>
        <div className="dp-panel-body">
          <div>
            <span className="dp-psec">Trip Details</span>
            {[
              ['Customer', t.customer],
              ['Date', t.date],
              ['Time', t.time],
              ['Duration', t.duration],
              ['Cargo', t.cargo],
              ['Weight', t.weight],
              ['Amount', `KES ${t.amount.toLocaleString()}`],
              ['Status', t.status]
            ].map(([l, v]) => (
              <div key={l} className="dp-ir">
                <span className="dp-ir-l">{l}</span>
                <span className="dp-ir-v">
                  {l === 'Status' ? <span className={`dp-pill dp-pill-${v}`}>{v}</span> : v}
                </span>
              </div>
            ))}
            {t.notes && (
              <div className="dp-ir">
                <span className="dp-ir-l">Notes</span>
                <span className="dp-ir-v" style={{ maxWidth: 220, textAlign: 'right' }}>{t.notes}</span>
              </div>
            )}
          </div>
          <div>
            <span className="dp-psec">Route</span>
            <div style={{ 
              padding: '14px', 
              background: 'var(--off)', 
              border: '1px solid var(--border-l)', 
              borderRadius: 'var(--r)' 
            }}>
              <div className="dp-route-row" style={{ marginBottom: 8 }}>
                <div className="dp-route-dot from" />
                <span className="dp-route-label">From</span>
                <span className="dp-route-val">{t.from}</span>
              </div>
              <div className="dp-route-line" style={{ marginLeft: 3.5, marginBottom: 8 }} />
              <div className="dp-route-row">
                <div className="dp-route-dot to" />
                <span className="dp-route-label">To</span>
                <span className="dp-route-val">{t.to}</span>
              </div>
            </div>
          </div>
          {(t.status === 'pending' || t.status === 'active') && (
            <div>
              <span className="dp-psec">Actions</span>
              <div className="dp-prow">
                {t.status === 'pending' && (
                  <button className="dp-btn dp-btn-success" onClick={() => updateTripStatus(t.id, 'active')}>
                    <FaPlay /> Start Trip
                  </button>
                )}
                {t.status === 'active' && (
                  <button className="dp-btn dp-btn-primary" onClick={() => updateTripStatus(t.id, 'completed')}>
                    <FaCheck /> Complete
                  </button>
                )}
                <button className="dp-btn dp-btn-danger" onClick={() => updateTripStatus(t.id, 'cancelled')}>
                  <FaBan /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}