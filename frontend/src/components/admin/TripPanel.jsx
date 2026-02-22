import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function TripPanel({ panel, setPanel, trips }) {
  if (!panel.open || panel.type !== 'trip' || !panel.data) return null;

  const t = trips.find(x => x.id === panel.data.id) || panel.data;

  return (
    <>
      <div className={`ap-overlay ${panel.open ? 'open' : ''}`} onClick={() => setPanel(p => ({ ...p, open: false }))} />
      <div className={`ap-panel ${panel.open ? 'open' : ''}`}>
        <div className="ap-panel-head">
          <div className="ap-panel-title">{t.tripId}</div>
          <button className="ap-panel-close" onClick={() => setPanel(p => ({ ...p, open: false }))}>
            <FaTimes />
          </button>
        </div>
        <div className="ap-panel-body">
          <div>
            <span className="ap-psec">Trip Details</span>
            {[
              ['Trip ID', t.tripId],
              ['Driver', t.driver],
              ['From', t.from],
              ['To', t.to],
              ['Amount', `KES ${t.amount.toLocaleString()}`],
              ['Status', t.status],
              ['Date', t.date]
            ].map(([l, v]) => (
              <div key={l} className="ap-ir">
                <span className="ap-ir-l">{l}</span>
                <span className="ap-ir-v">
                  {l === 'Status' ? <span className={`ap-pill ap-pill-${v}`}>{v}</span> : v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}