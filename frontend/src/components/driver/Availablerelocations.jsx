import { useState, useEffect, useCallback } from 'react';
import { FaHome, FaMapMarkerAlt, FaClock, FaTruck, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import { getNearbyRelocations, acceptRelocationDriver } from '../../api';

// Vehicle type labels
const VEHICLE_LABELS = {
  bicycle: '🚲 Bicycle',
  bike: '🏍️ Motorbike',
  car: '🚗 Car',
  van: '🚐 Van',
  lorry: '🚛 Lorry',
};

// Service type colours
const SERVICE_COLOURS = {
  Standard: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  'Same Day': { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
  Express: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
};

/**
 * Countdown timer hook — returns formatted remaining time string.
 */
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expired');
        setExpired(true);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs.toString().padStart(2, '0')}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return { remaining, expired };
}

/**
 * Single relocation job card.
 */
function RelocationCard({ relocation, onAccept, accepting }) {
  // Window expiry: creation time + selfDispatchWindowMs (default 30 min)
  const windowMs = relocation.selfDispatchWindowMs || 30 * 60 * 1000;
  const expiresAt = new Date(new Date(relocation.createdAt).getTime() + windowMs);
  const { remaining, expired } = useCountdown(expiresAt);

  const svcStyle = SERVICE_COLOURS[relocation.serviceType] || SERVICE_COLOURS.Standard;
  const scheduledDate = new Date(relocation.scheduledDate);
  const isToday = scheduledDate.toDateString() === new Date().toDateString();
  const isTomorrow =
    scheduledDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const dateLabel = isToday
    ? `Today at ${scheduledDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`
    : isTomorrow
    ? `Tomorrow at ${scheduledDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`
    : scheduledDate.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: expired ? 0.5 : 1,
        transition: 'box-shadow .2s',
        boxShadow: expired ? 'none' : '0 2px 8px rgba(0,0,0,.06)',
      }}
    >
      {/* Header: service type badge + countdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 99,
            fontSize: '.7rem',
            fontWeight: 700,
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            background: svcStyle.bg,
            color: svcStyle.color,
            border: `1px solid ${svcStyle.border}`,
          }}
        >
          {relocation.serviceType}
        </span>

        {/* Countdown clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '.78rem',
            fontWeight: 700,
            color: expired ? '#94a3b8' : remaining.startsWith('0m') ? '#dc2626' : '#92400e',
          }}
        >
          <FaClock size={11} />
          {expired ? 'Window closed' : `Accept in ${remaining}`}
        </div>
      </div>

      {/* Route */}
      <div
        style={{
          background: 'var(--off)',
          border: '1px solid var(--border-l)',
          borderRadius: 'var(--r)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ color: '#22c55e', marginTop: 2 }}><FaMapMarkerAlt size={12} /></span>
          <div>
            <div style={{ fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Pickup</div>
            <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--black)' }}>{relocation.pickupAddress}</div>
          </div>
        </div>
        <div style={{ marginLeft: 5, borderLeft: '2px dashed var(--border)', height: 12 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ color: '#dc2626', marginTop: 2 }}><FaMapMarkerAlt size={12} /></span>
          <div>
            <div style={{ fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Destination</div>
            <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--black)' }}>{relocation.destinationAddress}</div>
          </div>
        </div>
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { icon: '📅', label: dateLabel },
          { icon: '🛻', label: VEHICLE_LABELS[relocation.vehicleType] || relocation.vehicleType },
          { icon: '📏', label: `${relocation.distanceKm?.toFixed(1) || '?'} km` },
          { icon: '📦', label: relocation.estimatedVolume },
        ].map(({ icon, label }) => (
          <span
            key={label}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', background: 'var(--off)',
              borderRadius: 99, fontSize: '.78rem', color: 'var(--txt)',
              border: '1px solid var(--border-l)',
            }}
          >
            {icon} {label}
          </span>
        ))}
      </div>

      {/* Price + Accept */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 2 }}>Earnings</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-d)', color: 'var(--black)' }}>
            KES {(relocation.price || 0).toLocaleString()}
          </div>
        </div>

        <button
          onClick={() => onAccept(relocation._id)}
          disabled={expired || accepting === relocation._id}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '11px 22px',
            background: expired ? 'var(--off)' : 'var(--red)',
            color: expired ? 'var(--muted)' : '#fff',
            border: 'none', borderRadius: 'var(--r-sm)',
            fontWeight: 700, fontSize: '.88rem', cursor: expired ? 'default' : 'pointer',
            transition: 'all .15s',
            opacity: accepting === relocation._id ? 0.7 : 1,
          }}
        >
          {accepting === relocation._id ? (
            'Accepting…'
          ) : expired ? (
            'Closed'
          ) : (
            <>
              <FaCheckCircle size={14} /> Accept Job <FaChevronRight size={11} />
            </>
          )}
        </button>
      </div>

      {/* Items preview */}
      {relocation.itemsDescription && (
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', borderTop: '1px solid var(--border-l)', paddingTop: 10 }}>
          <strong>Items:</strong> {relocation.itemsDescription}
        </div>
      )}
    </div>
  );
}

/**
 * Main AvailableRelocations page.
 * Shows all pending relocation jobs the driver can self-dispatch on.
 */
export default function AvailableRelocations({ active, toast, isOnline, onAccepted }) {
  const [relocations, setRelocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchRelocations = useCallback(async () => {
    if (!isOnline) return;
    try {
      setLoading(true);
      const data = await getNearbyRelocations();
      setRelocations(data.requests || []);
      setLastRefresh(new Date());
    } catch (err) {
      // Not online or no GPS → silently swallow; driver sees "Go Online" prompt
      setRelocations([]);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Initial load + refresh every 60s
  useEffect(() => {
    if (!active) return;
    fetchRelocations();
    const id = setInterval(fetchRelocations, 60000);
    return () => clearInterval(id);
  }, [active, fetchRelocations]);

  const handleAccept = async (relocationId) => {
    try {
      setAccepting(relocationId);
      await acceptRelocationDriver(relocationId);
      toast('🎉 Relocation job accepted!');
      setRelocations((prev) => prev.filter((r) => r._id !== relocationId));
      if (onAccepted) onAccepted();
    } catch (err) {
      toast(err.message || 'Could not accept this job. It may have been taken.', 'error');
    } finally {
      setAccepting(null);
    }
  };

  if (!active) return null;

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Self-Dispatch</div>
        <h1 className="dp-page-title">Available <span>Relocations</span></h1>
        <p className="dp-page-desc">
          Jobs open for you to accept. First driver to accept gets the job — no admin picks.
          Each job has a countdown window; after that the system auto-assigns.
        </p>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div
          style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 'var(--r)', padding: '14px 18px',
            color: '#92400e', fontSize: '.88rem',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span>You're offline. Go online to see and accept available relocation jobs.</span>
        </div>
      )}

      {/* Refresh bar */}
      {isOnline && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
            {lastRefresh ? `Refreshed at ${lastRefresh.toLocaleTimeString()}` : 'Loading…'}
          </span>
          <button
            className="dp-btn dp-btn-outline dp-btn-sm"
            onClick={fetchRelocations}
            disabled={loading}
          >
            {loading ? '⏳ Refreshing…' : '🔄 Refresh'}
          </button>
        </div>
      )}

      {/* Job cards */}
      {loading && relocations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <FaTruck size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Loading available jobs…</div>
        </div>
      ) : relocations.length === 0 ? (
        <div
          style={{
            textAlign: 'center', padding: '60px 24px',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
          }}
        >
          <FaHome size={36} style={{ color: 'var(--muted)', marginBottom: 14, opacity: 0.35 }} />
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', marginBottom: 6, color: 'var(--black)' }}>
            No relocations available right now
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--muted)', maxWidth: 360, margin: '0 auto' }}>
            {isOnline
              ? 'New jobs will appear here automatically. This page refreshes every minute.'
              : 'Go online to start seeing available relocation jobs.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {relocations.map((r) => (
            <RelocationCard
              key={r._id}
              relocation={r}
              onAccept={handleAccept}
              accepting={accepting}
            />
          ))}
        </div>
      )}

      {/* How it works info */}
      <div
        style={{
          marginTop: 32, background: 'var(--red-ghost)',
          border: '1px solid var(--red-border)',
          borderRadius: 'var(--r)', padding: '16px 18px',
          fontSize: '.82rem', color: 'var(--txt)', lineHeight: 1.65,
        }}
      >
        <strong style={{ color: 'var(--red)' }}>How driver assignment works:</strong>
        <ol style={{ margin: '8px 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>A client places a relocation request and all eligible online drivers are notified.</li>
          <li>The first driver to press <em>Accept Job</em> gets it — no admin decision needed.</li>
          <li>If no driver accepts before the window expires, the system auto-assigns the best match by distance, workload, and rating.</li>
          <li>Admins can only intervene within 4 hours of the move date, and every override is logged.</li>
        </ol>
      </div>
    </div>
  );
}