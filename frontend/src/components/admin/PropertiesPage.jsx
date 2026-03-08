import React, { useState } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaEye, FaFilter } from 'react-icons/fa';

const STATUS_PILL = {
  pending:  { cls: 'ap-pill-amber',  label: 'Pending'  },
  approved: { cls: 'ap-pill-green',  label: 'Approved' },
  active:   { cls: 'ap-pill-green',  label: 'Active'   },
  rejected: { cls: 'ap-pill-red',    label: 'Rejected' },
  inactive: { cls: 'ap-pill-muted',  label: 'Inactive' },
};

const VERIFIED_BADGE = ({ isVerified }) =>
  isVerified
    ? <span style={{ color: 'var(--green, #1a9448)', fontSize: '.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><FaCheckCircle size={10} /> Verified</span>
    : <span style={{ color: 'var(--amber, #d49210)', fontSize: '.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>Unverified</span>;

export default function PropertiesPage({
  active,
  filtProps,
  propSearch,
  setPropSearch,
  setPanel,
  onVerifyProperty,   // (id, status) => void  — passed from AdminLayout
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null); // id being actioned

  if (!active) return null;

  /* ── local filter by status ── */
  const displayed = statusFilter === 'all'
    ? filtProps
    : filtProps.filter(p => p.status === statusFilter);

  const handleAction = async (id, newStatus) => {
    if (!onVerifyProperty) return;
    setActionLoading(id);
    try {
      await onVerifyProperty(id, newStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all:      filtProps.length,
    pending:  filtProps.filter(p => p.status === 'pending').length,
    approved: filtProps.filter(p => p.status === 'approved' || p.status === 'active').length,
    rejected: filtProps.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="ap-page active">
      {/* ── Header ── */}
      <div className="ap-page-header">
        <div className="ap-tag">Storage</div>
        <h1 className="ap-page-title">All <span>Properties</span></h1>
        <p className="ap-page-desc">
          Review and verify storage properties submitted by landlords.
          Approved properties become visible to clients.
        </p>
      </div>

      {/* ── Summary badges ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: 'All',      color: 'var(--dark, #1a1a2e)'  },
          { key: 'pending',  label: 'Pending',  color: 'var(--amber, #d49210)' },
          { key: 'approved', label: 'Approved', color: 'var(--green, #1a9448)' },
          { key: 'rejected', label: 'Rejected', color: 'var(--red, #c8302a)'   },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              border: `1.5px solid ${statusFilter === key ? color : 'var(--border, #e2e8f0)'}`,
              background: statusFilter === key ? color : '#fff',
              color: statusFilter === key ? '#fff' : 'var(--muted, #6b7280)',
              fontSize: '.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {label}
            <span style={{
              background: statusFilter === key ? 'rgba(255,255,255,.25)' : 'var(--border-l, #f1f5f9)',
              color: statusFilter === key ? '#fff' : 'var(--txt, #374151)',
              borderRadius: 99,
              padding: '1px 7px',
              fontSize: '.7rem',
              fontWeight: 800,
            }}>{counts[key] ?? filtProps.length}</span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><FaSearch size={12} /></span>
          <input
            placeholder="Search by property name, owner or address…"
            value={propSearch}
            onChange={e => setPropSearch(e.target.value)}
          />
        </div>
        <span className="ap-meta">{displayed.length} {displayed.length === 1 ? 'property' : 'properties'}</span>
      </div>

      {/* ── Table ── */}
      <div className="ap-card">
        <div className="ap-table-wrap">
          {displayed.length === 0 ? (
            <div className="ap-empty">No properties match your current filters.</div>
          ) : (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Type / Size</th>
                  <th>Price / mo</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => {
                  const pill  = STATUS_PILL[p.status] || { cls: 'ap-pill-muted', label: p.status };
                  const busy  = actionLoading === p.id;
                  const isPending   = p.status === 'pending';
                  const isApproved  = p.status === 'approved' || p.status === 'active';
                  const isRejected  = p.status === 'rejected';

                  return (
                    <tr key={p.id}>
                      {/* Name */}
                      <td>
                        <div className="ap-td-name" style={{ maxWidth: 180 }}>{p.name || p.title || '—'}</div>
                        {p.address && (
                          <div className="ap-td-muted" style={{ fontSize: '.71rem', marginTop: 2 }}>
                            📍 {p.address}
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="ap-td-muted">{p.owner || '—'}</td>

                      {/* Type / Size */}
                      <td>
                        <div style={{ fontSize: '.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {p.storageType || '—'}
                        </div>
                        {p.sizeSqFt && (
                          <div className="ap-td-muted" style={{ fontSize: '.71rem' }}>{p.sizeSqFt} sq ft</div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="ap-td-numeric">
                        {p.pricePerMonth ? `KES ${p.pricePerMonth.toLocaleString()}` : '—'}
                      </td>

                      {/* Status pill */}
                      <td><span className={`ap-pill ${pill.cls}`}>{pill.label}</span></td>

                      {/* Verified badge */}
                      <td><VERIFIED_BADGE isVerified={p.isVerified} /></td>

                      {/* Action buttons */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* View details */}
                          <button
                            className="ap-btn-sm ap-btn-ghost"
                            title="View details"
                            onClick={() => setPanel && setPanel({ open: true, type: 'property', data: p })}
                            style={btnStyle('#6b7280')}
                          >
                            <FaEye size={11} /> View
                          </button>

                          {/* Approve / Verify */}
                          {!isApproved && (
                            <button
                              disabled={busy}
                              title="Approve & verify property — makes it visible to clients"
                              onClick={() => handleAction(p.id, 'approved')}
                              style={btnStyle('#1a9448', busy)}
                            >
                              {busy ? '…' : <><FaCheckCircle size={11} /> Approve</>}
                            </button>
                          )}

                          {/* Reject */}
                          {!isRejected && (
                            <button
                              disabled={busy}
                              title="Reject property — hides it from clients"
                              onClick={() => handleAction(p.id, 'rejected')}
                              style={btnStyle('#c8302a', busy)}
                            >
                              {busy ? '…' : <><FaTimesCircle size={11} /> Reject</>}
                            </button>
                          )}

                          {/* Re-activate if rejected */}
                          {isRejected && (
                            <button
                              disabled={busy}
                              title="Set back to pending for re-review"
                              onClick={() => handleAction(p.id, 'pending')}
                              style={btnStyle('#d49210', busy)}
                            >
                              {busy ? '…' : 'Re-review'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <p style={{ fontSize: '.73rem', color: 'var(--muted, #6b7280)', marginTop: 10 }}>
        ✅ <strong>Approving</strong> a property sets it as verified and makes it visible to clients on the storage browse page.&nbsp;
        ❌ <strong>Rejecting</strong> hides it from clients until the landlord updates and resubmits.
      </p>
    </div>
  );
}

/* tiny shared button style helper */
function btnStyle(color, disabled = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 6,
    border: `1.5px solid ${color}`,
    background: 'transparent',
    color,
    fontSize: '.72rem',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all .15s',
    whiteSpace: 'nowrap',
  };
}