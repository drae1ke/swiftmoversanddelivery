import React, { useState } from 'react';
import { FaSearch, FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaClock } from 'react-icons/fa';

const STATUS_META = {
  pending:    { cls: 'ap-pill-amber', label: 'Pending',    icon: '⏳' },
  assigned:   { cls: 'ap-pill-blue',  label: 'Assigned',   icon: '👤' },
  'in-transit':{ cls: 'ap-pill-green', label: 'In Transit', icon: '🚛' },
  completed:  { cls: 'ap-pill-muted', label: 'Completed',  icon: '✅' },
  cancelled:  { cls: 'ap-pill-red',   label: 'Cancelled',  icon: '❌' },
};

const VEHICLE_ICONS = {
  van:    '🚐',
  truck:  '🚛',
  pickup: '🛻',
  lorry:  '🚚',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function RelocationsPage({ active, relocations = [], relocSearch, setRelocSearch }) {
  const [statusFilter, setStatusFilter] = useState('all');

  if (!active) return null;

  /* ── Filter ── */
  const displayed = relocations.filter(r => {
    const q = (relocSearch || '').toLowerCase();
    const matchSearch = !q ||
      (r.client?.fullName || '').toLowerCase().includes(q) ||
      (r.pickupAddress || '').toLowerCase().includes(q) ||
      (r.dropoffAddress || '').toLowerCase().includes(q) ||
      (r._id || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  /* ── Counts per status tab ── */
  const counts = ['all', 'pending', 'assigned', 'in-transit', 'completed', 'cancelled'].reduce((acc, s) => {
    acc[s] = s === 'all' ? relocations.length : relocations.filter(r => r.status === s).length;
    return acc;
  }, {});

  const tabs = [
    { key: 'all',         label: 'All',        color: 'var(--dark, #1a1a2e)'  },
    { key: 'pending',     label: 'Pending',    color: 'var(--amber, #d49210)' },
    { key: 'assigned',    label: 'Assigned',   color: '#2563eb'               },
    { key: 'in-transit',  label: 'In Transit', color: 'var(--green, #1a9448)' },
    { key: 'completed',   label: 'Completed',  color: '#6b7280'               },
    { key: 'cancelled',   label: 'Cancelled',  color: 'var(--red, #c8302a)'   },
  ];

  return (
    <div className="ap-page active">
      {/* ── Header ── */}
      <div className="ap-page-header">
        <div className="ap-tag">Logistics</div>
        <h1 className="ap-page-title">Relocation <span>Requests</span></h1>
        <p className="ap-page-desc">
          View all scheduled relocation jobs. Monitor status, client info, pickup/drop-off
          locations, and assigned drivers.
        </p>
      </div>

      {/* ── Status filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            style={{
              padding: '5px 13px',
              borderRadius: 99,
              border: `1.5px solid ${statusFilter === key ? color : 'var(--border, #e2e8f0)'}`,
              background: statusFilter === key ? color : '#fff',
              color: statusFilter === key ? '#fff' : 'var(--muted, #6b7280)',
              fontSize: '.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {label}
            {counts[key] > 0 && (
              <span style={{
                background: statusFilter === key ? 'rgba(255,255,255,.22)' : 'var(--border-l, #f1f5f9)',
                color: statusFilter === key ? '#fff' : 'var(--txt, #374151)',
                borderRadius: 99,
                padding: '1px 7px',
                fontSize: '.69rem',
                fontWeight: 800,
              }}>{counts[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><FaSearch size={12} /></span>
          <input
            placeholder="Search by client name, pickup or drop-off address…"
            value={relocSearch || ''}
            onChange={e => setRelocSearch(e.target.value)}
          />
        </div>
        <span className="ap-meta">{displayed.length} {displayed.length === 1 ? 'request' : 'requests'}</span>
      </div>

      {/* ── Cards (mobile-friendly) or table ── */}
      {displayed.length === 0 ? (
        <div className="ap-card">
          <div className="ap-empty">No relocation requests match your filters.</div>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="ap-card" style={{ overflowX: 'auto' }}>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Pickup</th>
                    <th>Drop-off</th>
                    <th>Scheduled</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(r => {
                    const meta   = STATUS_META[r.status] || { cls: 'ap-pill-muted', label: r.status, icon: '•' };
                    const vIcon  = VEHICLE_ICONS[r.vehicleType] || '🚛';
                    const shortId = (r._id || '').slice(-8).toUpperCase();
                    const driverName = r.assignedDriver?.user?.fullName || null;

                    return (
                      <tr key={r._id}>
                        {/* ID */}
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--muted)' }}>
                            #{shortId}
                          </span>
                        </td>

                        {/* Client */}
                        <td>
                          <div className="ap-td-name" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FaUser size={10} style={{ color: 'var(--muted)' }} />
                            {r.client?.fullName || '—'}
                          </div>
                          {r.client?.email && (
                            <div className="ap-td-muted" style={{ fontSize: '.69rem' }}>{r.client.email}</div>
                          )}
                        </td>

                        {/* Pickup */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, maxWidth: 160 }}>
                            <FaMapMarkerAlt size={10} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: '.78rem', lineHeight: 1.4 }}>{r.pickupAddress || '—'}</span>
                          </div>
                        </td>

                        {/* Drop-off */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, maxWidth: 160 }}>
                            <FaMapMarkerAlt size={10} style={{ color: '#c8302a', marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: '.78rem', lineHeight: 1.4 }}>{r.dropoffAddress || '—'}</span>
                          </div>
                        </td>

                        {/* Scheduled date */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.77rem', whiteSpace: 'nowrap' }}>
                            <FaCalendarAlt size={10} style={{ color: 'var(--muted)' }} />
                            {r.scheduledDate ? formatShortDate(r.scheduledDate) : (
                              r.preferredDate ? formatShortDate(r.preferredDate) : '—'
                            )}
                          </div>
                          {r.createdAt && (
                            <div className="ap-td-muted" style={{ fontSize: '.68rem', marginTop: 2 }}>
                              Submitted {formatShortDate(r.createdAt)}
                            </div>
                          )}
                        </td>

                        {/* Vehicle */}
                        <td>
                          <span style={{ fontSize: '.85rem' }}>{vIcon}</span>{' '}
                          <span style={{ fontSize: '.75rem', textTransform: 'capitalize' }}>{r.vehicleType || '—'}</span>
                        </td>

                        {/* Driver */}
                        <td>
                          {driverName
                            ? <span style={{ fontSize: '.78rem', fontWeight: 600 }}>{driverName}</span>
                            : <span style={{ fontSize: '.73rem', color: 'var(--muted)' }}>Unassigned</span>
                          }
                          {r.assignmentMethod === 'admin-override' && (
                            <div style={{ fontSize: '.65rem', color: '#d49210', marginTop: 2 }}>⚠ Admin override</div>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`ap-pill ${meta.cls}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Summary footer ── */}
          <div style={{
            display: 'flex',
            gap: 16,
            marginTop: 14,
            flexWrap: 'wrap',
            fontSize: '.74rem',
            color: 'var(--muted)',
          }}>
            {[
              { label: '⏳ Pending',     val: counts.pending     },
              { label: '👤 Assigned',    val: counts.assigned    },
              { label: '🚛 In Transit',  val: ['in-transit']     .reduce((s,k) => s + (counts[k]||0), 0) },
              { label: '✅ Completed',   val: counts.completed   },
            ].map(({ label, val }) => (
              <span key={label}>
                <strong style={{ color: 'var(--txt)' }}>{val}</strong> {label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}