import React from 'react';
import { FaTimes, FaPlay, FaCheck, FaBan, FaPhone, FaHandshake } from 'react-icons/fa';

export default function TripPanel({ panel, setPanel, trips, updateTripStatus, handleAcceptOrder }) {
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
              ['Type', t.type === 'relocation' ? 'Relocation' : 'Delivery'],
              ['Cargo', t.cargo],
              ['Weight', t.weight],
              ['Vehicle', t.vehicleType || '—'],
              ['Service', t.serviceType || 'Standard'],
              ['Amount', `KES ${(t.amount || 0).toLocaleString()}`],
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

          {/* Client contact info */}
          {(t.customer || t.customerPhone) && (
            <div>
              <span className="dp-psec">Client Contact</span>
              <div style={{ 
                padding: '14px', 
                background: 'var(--off)', 
                border: '1px solid var(--border-l)', 
                borderRadius: 'var(--r)',
                marginBottom: 8
              }}>
                <div className="dp-ir">
                  <span className="dp-ir-l">Name</span>
                  <span className="dp-ir-v">{t.customer}</span>
                </div>
                {t.customerPhone && (
                  <div className="dp-ir">
                    <span className="dp-ir-l">Phone</span>
                    <span className="dp-ir-v">
                      <a href={`tel:${t.customerPhone}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                        <FaPhone size={10} style={{ marginRight: 4 }} />{t.customerPhone}
                      </a>
                    </span>
                  </div>
                )}
                {t.customerEmail && (
                  <div className="dp-ir">
                    <span className="dp-ir-l">Email</span>
                    <span className="dp-ir-v">{t.customerEmail}</span>
                  </div>
                )}
              </div>
              {t.customerPhone && (
                <a href={`tel:${t.customerPhone}`} className="dp-btn dp-btn-outline" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                  <FaPhone /> Call Client
                </a>
              )}
            </div>
          )}

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

          <div>
            <span className="dp-psec">Actions</span>
            <div className="dp-prow">
              {/* Accept button for pending unassigned orders */}
              {t.status === 'pending' && t.rawStatus === 'pending' && handleAcceptOrder && (
                <button className="dp-btn dp-btn-success" onClick={() => handleAcceptOrder(t)}>
                  <FaHandshake /> Accept Order
                </button>
              )}
              {/* Start trip for assigned orders */}
              {t.status === 'active' && t.rawStatus === 'assigned' && (
                <button className="dp-btn dp-btn-success" onClick={() => updateTripStatus(t.id, 'active')}>
                  <FaPlay /> Start Trip
                </button>
              )}
              {/* Complete for in-transit */}
              {t.status === 'active' && t.rawStatus === 'in-transit' && (
                <button className="dp-btn dp-btn-primary" onClick={() => updateTripStatus(t.id, 'completed')}>
                  <FaCheck /> Complete
                </button>
              )}
              {(t.status === 'pending' || t.status === 'active') && (
                <button className="dp-btn dp-btn-danger" onClick={() => updateTripStatus(t.id, 'cancelled')}>
                  <FaBan /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
