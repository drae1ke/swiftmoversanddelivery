import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

export default function EarningsPage({ active, totalEarnings, completedTrips }) {
  if (!active) return null;

  const avgPerTrip = completedTrips.length ? (totalEarnings / completedTrips.length).toFixed(0) : 0;

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Financials</div>
        <h1 className="dp-page-title">My <span>Earnings</span></h1>
        <p className="dp-page-desc">Breakdown of payments from completed trips.</p>
      </div>
      <div className="dp-earn-grid">
        <div className="dp-earn-card">
          <div className="dp-earn-label">Total Earnings</div>
          <div className="dp-earn-val">KES {totalEarnings.toLocaleString()}</div>
          <div className="dp-earn-sub">from {completedTrips.length} completed trips</div>
        </div>
        <div className="dp-earn-card">
          <div className="dp-earn-label">Avg per Trip</div>
          <div className="dp-earn-val">KES {avgPerTrip}</div>
          <div className="dp-earn-sub">average payout</div>
        </div>
      </div>
      <div className="dp-card dp-card-pad" style={{ maxWidth: 700 }}>
        <div className="dp-sec-header">
          <div className="dp-sec-title">Trip Payouts</div>
        </div>
        <div className="dp-earn-breakdown">
          {completedTrips.map(t => (
            <div key={t.id} className="dp-earn-row">
              <div>
                <div style={{ fontSize: '.87rem', fontWeight: 600, color: 'var(--black)' }}>{t.tripId}</div>
                <div style={{ fontSize: '.73rem', color: 'var(--muted)' }}>{t.from} → {t.to} · {t.date}</div>
              </div>
              <div className="dp-earn-row-val green">+ KES {t.amount.toLocaleString()}</div>
            </div>
          ))}
          {completedTrips.length === 0 && (
            <div className="dp-empty">No completed trips yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}