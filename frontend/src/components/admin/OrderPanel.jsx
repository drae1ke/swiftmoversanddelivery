import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function OrderPanel({ panel, setPanel, orders, drivers, onAssign, onStatusUpdate }) {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  if (!panel.open || panel.type !== 'order' || !panel.data) return null;

  const o = orders.find(x => x.id === panel.data.id) || panel.data;

  const statusLabel = (s) => {
    if (s === 'in-transit') return 'In Transit';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(o.id, selectedDriver);
      setSelectedDriver('');
    }
  };

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      onStatusUpdate(o.id, selectedStatus);
      setSelectedStatus('');
    }
  };

  return (
    <>
      <div className={`ap-overlay ${panel.open ? 'open' : ''}`} onClick={() => setPanel(p => ({ ...p, open: false }))} />
      <div className={`ap-panel ${panel.open ? 'open' : ''}`}>
        <div className="ap-panel-head">
          <div className="ap-panel-title">Order #{o.shortId}</div>
          <button className="ap-panel-close" onClick={() => setPanel(p => ({ ...p, open: false }))}>
            <FaTimes />
          </button>
        </div>
        <div className="ap-panel-body">
          <div>
            <span className="ap-psec">Order Details</span>
            {[
              ['Order ID', `#${o.shortId}`],
              ['Client', o.clientName],
              ['Client Email', o.clientEmail || '—'],
              ['Driver', o.driverName],
              ['Pickup', o.from],
              ['Dropoff', o.to],
              ['Recipient', o.recipientName || '—'],
              ['Recipient Phone', o.recipientPhone || '—'],
              ['Vehicle', o.vehicleType],
              ['Service', o.serviceType || 'Standard'],
              ['Distance', `${o.distanceKm ? o.distanceKm.toFixed(1) : '—'} km`],
              ['Weight', `${o.weightKg || '—'} kg`],
              ['Amount', `KES ${o.amount.toLocaleString()}`],
              ['Status', o.status],
              ['Created', o.date],
              ['Delivered', o.deliveredAt || '—'],
            ].map(([l, v]) => (
              <div key={l} className="ap-ir">
                <span className="ap-ir-l">{l}</span>
                <span className="ap-ir-v">
                  {l === 'Status' ? <span className={`ap-pill ap-pill-${v}`}>{statusLabel(v)}</span> : v}
                </span>
              </div>
            ))}
          </div>

          {/* Assign Driver */}
          {o.status === 'pending' && drivers && drivers.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <span className="ap-psec">Assign Driver</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '.85rem'
                  }}
                >
                  <option value="">Select a driver…</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.vehicleType || 'No vehicle'}
                    </option>
                  ))}
                </select>
                <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={handleAssign} disabled={!selectedDriver}>
                  Assign
                </button>
              </div>
            </div>
          )}

          {/* Update Status */}
          <div style={{ marginTop: 24 }}>
            <span className="ap-psec">Update Status</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '.85rem'
                }}
              >
                <option value="">Select status…</option>
                {['pending', 'assigned', 'in-transit', 'delivered']
                  .filter(s => s !== o.status)
                  .map(s => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
              </select>
              <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={handleStatusUpdate} disabled={!selectedStatus}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
