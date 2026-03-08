import React, { useState } from 'react';
import {
  FaHome, FaTruck, FaMapMarkerAlt, FaClock,
  FaBoxOpen, FaCheckCircle, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateHeading(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.round(diff / 86400000);
}

const STATUS_META = {
  active:    { label: 'In Progress', cls: 'dp-pill-active',   dot: '#22c55e' },
  assigned:  { label: 'Confirmed',   cls: 'dp-pill-active',   dot: '#3b82f6' },
  pending:   { label: 'Pending',     cls: 'dp-pill-pending',  dot: '#f59e0b' },
  completed: { label: 'Completed',   cls: 'dp-pill-done',     dot: '#94a3b8' },
};

// ── Single schedule card ──────────────────────────────────────────────────────

function ScheduleCard({ item, setPanel }) {
  const [expanded, setExpanded] = useState(false);
  const isRelocation = item.type === 'relocation';
  const meta = STATUS_META[item.status] || STATUS_META.pending;

  const urgency = daysUntil(item.scheduledDate ?? item.date);
  const urgencyColor =
    urgency === 0 ? '#dc2626' :
    urgency === 1 ? '#d97706' :
    '#64748b';

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${item.status === 'active' ? '#bbf7d0' : 'var(--border)'}`,
        borderLeft: `4px solid ${meta.dot}`,
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        transition: 'box-shadow .15s',
      }}
    >
      {/* ── Main row ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', cursor: 'pointer',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: isRelocation ? '#f0fdf4' : '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isRelocation ? '#16a34a' : '#2563eb',
        }}>
          {isRelocation ? <FaHome size={15} /> : <FaTruck size={15} />}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--black)' }}>
              {isRelocation ? 'Relocation Move' : `Delivery · ${item.tripId}`}
            </span>
            <span className={`dp-pill ${meta.cls}`} style={{ fontSize: '.68rem' }}>
              {meta.label}
            </span>
          </div>
          <div style={{
            fontSize: '.76rem', color: 'var(--muted)', marginTop: 3,
            display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
          }}>
            <FaMapMarkerAlt size={10} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
              {item.from}
            </span>
            <span>→</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
              {item.to}
            </span>
          </div>
        </div>

        {/* Time + expand toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.78rem', color: urgencyColor, fontWeight: 700 }}>
            <FaClock size={11} />
            {formatTime(item.scheduledDate ?? item.date)}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '.7rem' }}>
            {expanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
          </div>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border-l)',
          background: 'var(--off)',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Route */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#22c55e', marginTop: 2 }}><FaMapMarkerAlt size={11} /></span>
              <div>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Pickup</div>
                <div style={{ fontSize: '.84rem', fontWeight: 600 }}>{item.from || '—'}</div>
              </div>
            </div>
            <div style={{ marginLeft: 5, borderLeft: '2px dashed var(--border)', height: 10 }} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#dc2626', marginTop: 2 }}><FaMapMarkerAlt size={11} /></span>
              <div>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Destination</div>
                <div style={{ fontSize: '.84rem', fontWeight: 600 }}>{item.to || '—'}</div>
              </div>
            </div>
          </div>

          {/* Detail chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {isRelocation && item.estimatedVolume && (
              <Chip icon="📦" label={item.estimatedVolume} />
            )}
            {isRelocation && item.serviceType && (
              <Chip icon="⚡" label={item.serviceType} />
            )}
            {item.vehicleType && (
              <Chip icon="🚗" label={item.vehicleType} />
            )}
            {item.amount > 0 && (
              <Chip icon="💰" label={`KES ${item.amount.toLocaleString()}`} />
            )}
            {item.customer && (
              <Chip icon="👤" label={item.customer} />
            )}
            {item.cargo && !isRelocation && (
              <Chip icon="📦" label={item.cargo} />
            )}
          </div>

          {/* Items description for relocations */}
          {isRelocation && item.itemsDescription && (
            <div style={{
              fontSize: '.78rem', color: 'var(--txt)',
              background: '#fff', border: '1px solid var(--border-l)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <strong style={{ color: 'var(--muted)', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Items to move</strong>
              <div style={{ marginTop: 4 }}>{item.itemsDescription}</div>
            </div>
          )}

          {/* CTA */}
          {setPanel && (
            <button
              className="dp-btn dp-btn-outline dp-btn-sm"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => setPanel({ open: true, trip: item })}
            >
              View Full Details →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', background: '#fff',
      border: '1px solid var(--border-l)', borderRadius: 99,
      fontSize: '.75rem', color: 'var(--txt)',
    }}>
      {icon} {label}
    </span>
  );
}

// ── Main SchedulePage ─────────────────────────────────────────────────────────

export default function SchedulePage({ active, SCHEDULE, setPanel }) {
  if (!active) return null;

  // Separate into upcoming (pending/assigned/active) and done
  const upcoming = SCHEDULE.filter(s => s.status !== 'completed');
  const done     = SCHEDULE.filter(s => s.status === 'completed');

  // Group upcoming by date bucket
  const groups = {};
  upcoming.forEach(item => {
    const key = new Date(item.scheduledDate ?? item.date).toDateString();
    if (!groups[key]) groups[key] = { label: formatDateHeading(item.scheduledDate ?? item.date), items: [] };
    groups[key].items.push(item);
  });

  // Sort groups chronologically
  const sortedGroups = Object.entries(groups).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const todayCount = upcoming.filter(s => daysUntil(s.scheduledDate ?? s.date) === 0).length;
  const relocCount = upcoming.filter(s => s.type === 'relocation').length;

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Upcoming</div>
        <h1 className="dp-page-title">My <span>Schedule</span></h1>
        <p className="dp-page-desc">
          All your confirmed jobs — deliveries and relocation moves — ordered by date.
          Tap any card to see full details.
        </p>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24,
      }}>
        {[
          { icon: <FaClock size={13} />,   label: 'Today',       value: todayCount,        color: todayCount > 0 ? '#dc2626' : '#64748b' },
          { icon: <FaHome size={13} />,    label: 'Relocations', value: relocCount,         color: '#16a34a' },
          { icon: <FaTruck size={13} />,   label: 'Deliveries',  value: upcoming.length - relocCount, color: '#2563eb' },
          { icon: <FaCheckCircle size={13} />, label: 'Done',    value: done.length,        color: '#94a3b8' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{
            flex: '1 1 120px', minWidth: 100,
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: '.75rem', fontWeight: 600 }}>
              {icon} {label}
            </div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--black)', lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {upcoming.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}>
          <FaBoxOpen size={36} style={{ color: 'var(--muted)', marginBottom: 14, opacity: 0.3 }} />
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', marginBottom: 6, color: 'var(--black)' }}>
            No upcoming jobs
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
            Accepted deliveries and relocation moves will appear here.
          </div>
        </div>
      )}

      {/* Date groups */}
      {sortedGroups.map(([dateKey, group]) => (
        <div key={dateKey} style={{ marginBottom: 28 }}>
          {/* Date heading */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 12,
          }}>
            <div style={{
              fontFamily: 'var(--font-d)', fontWeight: 800,
              fontSize: '.82rem', textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: group.label === 'Today' ? '#dc2626' :
                     group.label === 'Tomorrow' ? '#d97706' : 'var(--muted)',
            }}>
              {group.label}
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--border-l)' }} />
            <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              {group.items.length} job{group.items.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Cards for this date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {group.items
              .sort((a, b) => new Date(a.scheduledDate ?? a.date) - new Date(b.scheduledDate ?? b.date))
              .map((item, i) => (
                <ScheduleCard key={item.id ?? i} item={item} setPanel={setPanel} />
              ))}
          </div>
        </div>
      ))}

      {/* Completed section (collapsed by default) */}
      {done.length > 0 && (
        <CompletedSection items={done} setPanel={setPanel} />
      )}
    </div>
  );
}

function CompletedSection({ items, setPanel }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '10px 0', color: 'var(--muted)', fontSize: '.8rem', fontWeight: 600,
        }}
      >
        {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        {items.length} completed job{items.length !== 1 ? 's' : ''}
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.6 }}>
          {items.map((item, i) => (
            <ScheduleCard key={item.id ?? i} item={item} setPanel={setPanel} />
          ))}
        </div>
      )}
    </div>
  );
}