import React from 'react';
import { FaPlus, FaWarehouse, FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';

const STORAGE_TYPE_LABELS = {
  room: 'Room', garage: 'Garage', warehouse: 'Warehouse',
  container: 'Container', basement: 'Basement', attic: 'Attic', other: 'Other',
};

export default function OverviewPage({ active, props, totalRevenue, openAddProp, setPage }) {
  if (!active) return null;

  const available = props.filter(p => p.availability === 'available').length;
  const unavailable = props.filter(p => p.availability === 'unavailable').length;
  const reserved = props.filter(p => p.availability === 'reserved').length;
  const pending = props.filter(p => p.status === 'pending').length;
  const totalViews = props.reduce((s, p) => s + (p.views || 0), 0);

  // Type breakdown
  const typeBreakdown = props.reduce((acc, p) => {
    const t = p.storageType || 'other';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Recent properties
  const recent = [...props]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="op-page active">
      <div className="op-page-hdr">
        <div>
          <div className="op-page-tag">Dashboard</div>
          <h1 className="op-page-title">Portfolio Overview</h1>
          <p className="op-page-desc">A snapshot of your storage listings and performance.</p>
        </div>
        <button className="op-btn op-btn-primary" onClick={openAddProp}>
          <FaPlus size={12} /> Add Property
        </button>
      </div>

      {/* Stat cards */}
      <div className="op-kpi-grid">
        <div className="op-kpi">
          <div className="op-kpi-label">Total Properties</div>
          <div className="op-kpi-val">{props.length}</div>
          <div className="op-kpi-sub">in your portfolio</div>
        </div>
        <div className="op-kpi">
          <div className="op-kpi-label">Available</div>
          <div className="op-kpi-val op-kpi-green">{available}</div>
          <div className="op-kpi-sub">ready to rent</div>
        </div>
        <div className="op-kpi">
          <div className="op-kpi-label">Reserved</div>
          <div className="op-kpi-val op-kpi-amber">{reserved}</div>
          <div className="op-kpi-sub">currently booked</div>
        </div>
        <div className="op-kpi">
          <div className="op-kpi-label">Unavailable</div>
          <div className="op-kpi-val op-kpi-red">{unavailable}</div>
          <div className="op-kpi-sub">offline / maintenance</div>
        </div>
        <div className="op-kpi">
          <div className="op-kpi-label">Est. Monthly Revenue</div>
          <div className="op-kpi-val">KES {Number(totalRevenue).toLocaleString()}</div>
          <div className="op-kpi-sub">from available + reserved</div>
        </div>
        <div className="op-kpi">
          <div className="op-kpi-label">Total Views</div>
          <div className="op-kpi-val">{totalViews.toLocaleString()}</div>
          <div className="op-kpi-sub">across all listings</div>
        </div>
      </div>

      <div className="op-two-col">
        {/* Recent listings */}
        <div className="op-card">
          <div className="op-card-hdr">
            <span className="op-card-title">Recent Listings</span>
            <button className="op-link" onClick={() => setPage('properties')}>View all</button>
          </div>
          {recent.length === 0 ? (
            <div className="op-empty-inline">No properties yet. <button className="op-link" onClick={openAddProp}>Add one</button></div>
          ) : (
            <div className="op-recent-list">
              {recent.map(p => (
                <div key={p.id} className="op-recent-row">
                  <div className="op-recent-icon">
                    <FaWarehouse size={14} />
                  </div>
                  <div className="op-recent-info">
                    <div className="op-recent-name">{p.title}</div>
                    <div className="op-recent-meta">
                      {STORAGE_TYPE_LABELS[p.storageType] || p.storageType}
                      {p.sizeSqFt ? ` · ${p.sizeSqFt.toLocaleString()} sq ft` : ''}
                      {p.address ? ` · ${p.address}` : ''}
                    </div>
                  </div>
                  <div className="op-recent-right">
                    <div className="op-recent-price">
                      {p.pricePerMonth ? `KES ${Number(p.pricePerMonth).toLocaleString()}` : '—'}
                    </div>
                    <span className={`op-pill op-pill-sm ${
                      p.availability === 'available' ? 'op-pill-green' :
                      p.availability === 'reserved' ? 'op-pill-amber' : 'op-pill-red'
                    }`}>
                      {p.availability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type breakdown */}
        <div className="op-card">
          <div className="op-card-hdr">
            <span className="op-card-title">Storage Types</span>
          </div>
          {Object.keys(typeBreakdown).length === 0 ? (
            <div className="op-empty-inline">No data yet.</div>
          ) : (
            <div className="op-type-breakdown">
              {Object.entries(typeBreakdown).map(([type, count]) => (
                <div key={type} className="op-type-row">
                  <span className="op-type-label">{STORAGE_TYPE_LABELS[type] || type}</span>
                  <div className="op-type-bar-wrap">
                    <div
                      className="op-type-bar"
                      style={{ width: `${Math.round((count / props.length) * 100)}%` }}
                    />
                  </div>
                  <span className="op-type-count">{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Status summary */}
          <div className="op-card-divider" />
          <div className="op-card-hdr">
            <span className="op-card-title">Approval Status</span>
          </div>
          <div className="op-status-list">
            {[
              { label: 'Active / Approved', value: props.filter(p => p.status === 'active' || p.status === 'approved').length, cls: 'op-pill-green' },
              { label: 'Pending Review', value: props.filter(p => p.status === 'pending').length, cls: 'op-pill-amber' },
              { label: 'Rejected / Inactive', value: props.filter(p => p.status === 'rejected' || p.status === 'inactive').length, cls: 'op-pill-red' },
            ].map(s => (
              <div key={s.label} className="op-status-row">
                <span className={`op-pill op-pill-sm ${s.cls}`}>{s.label}</span>
                <span className="op-status-val">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}