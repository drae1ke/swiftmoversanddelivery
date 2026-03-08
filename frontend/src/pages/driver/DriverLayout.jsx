import { useState, useEffect, useRef, useCallback } from "react";
import '../../styles/DriverDashboard.css';
import { useLocalToast } from '../../components/common/useLocalToast';
import {
  getDriverDashboard,
  getDriverProfile,
  updateDriverProfile,
  getNearbyOrders,
  getNearbyRelocations,
  acceptOrderDriver,
  acceptRelocationDriver,
  updateOrderStatusDriver,
  setDriverOnlineStatus,
  updateDriverLocation,
  getDriverMyOrders,
} from '../../api';

// Components
import Sidebar from '../../components/driver/Sidebar';
import OverviewPage from '../../components/driver/OverviewPage';
import TripsPage from '../../components/driver/TripsPage';
import SchedulePage from '../../components/driver/SchedulePage';
import EarningsPage from '../../components/driver/EarningsPage';
import DocumentsPage from '../../components/driver/DocumentsPage';
import ProfilePage from '../../components/driver/ProfilePage';
import TripPanel from '../../components/driver/TripPanel';
import LogoutModal from '../../components/driver/LogoutModal';
import Toast from '../../components/driver/Toast';
import AvailableRelocations from '../../components/driver/AvailableRelocations';

const GPS_PUSH_INTERVAL = 15000;

export default function DriverLayout() {
  const [trips, setTrips] = useState([]);
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState('overview');
  const { toasts, toast } = useLocalToast();
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [availableRelocCount, setAvailableRelocCount] = useState(0);

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', licence: '', vehicle: '', county: '' });
  const [editProf, setEditProf] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [tripFilter, setTripFilter] = useState('all');
  const [tripSearch, setTripSearch] = useState('');
  const [panel, setPanel] = useState({ open: false, trip: null });
  const [logoutModal, setLogoutModal] = useState(false);

  const gpsIntervalRef = useRef(null);
  const lastCoordsRef = useRef(null);

  // ── GPS ────────────────────────────────────────────────────────────────────

  const pushLocation = useCallback(async (coords) => {
    try {
      await updateDriverLocation([coords.longitude, coords.latitude]);
    } catch (err) {
      console.warn('GPS push failed:', err.message);
    }
  }, []);

  const startGPSTracking = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('tracking');
    navigator.geolocation.getCurrentPosition(
      (pos) => { lastCoordsRef.current = pos.coords; pushLocation(pos.coords); },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
    gpsIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => { lastCoordsRef.current = pos.coords; pushLocation(pos.coords); },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }, GPS_PUSH_INTERVAL);
  }, [pushLocation]);

  const stopGPSTracking = useCallback(() => {
    if (gpsIntervalRef.current) { clearInterval(gpsIntervalRef.current); gpsIntervalRef.current = null; }
    setGpsStatus('idle');
  }, []);

  useEffect(() => () => stopGPSTracking(), [stopGPSTracking]);

  // ── Online toggle ──────────────────────────────────────────────────────────

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    try {
      await setDriverOnlineStatus(newStatus);
      setIsOnline(newStatus);
      if (newStatus) {
        toast('You are now online. GPS tracking started.');
        startGPSTracking();
        fetchDriverData();
      } else {
        toast('You are now offline.');
        stopGPSTracking();
      }
    } catch (err) {
      toast(err.message || 'Failed to update online status', 'error');
    }
  };

  // ── Data ───────────────────────────────────────────────────────────────────

  const transformOrder = (order, type = 'delivery') => ({
    id: order._id,
    tripId: order._id?.slice(-8)?.toUpperCase(),
    type,
    status:
      order.status === 'assigned'  ? 'active'
      : order.status === 'in-transit' ? 'active'
      : ['delivered', 'completed'].includes(order.status) ? 'completed'
      : order.status || 'pending',
    rawStatus: order.status,
    from: order.pickupAddress || '',
    to: order.dropoffAddress || order.destinationAddress || '',
    cargo: order.itemsDescription || `${order.packageWeightKg || ''}kg package`,
    weight: order.packageWeightKg ? `${order.packageWeightKg} kg` : order.estimatedVolume || 'N/A',
    amount: order.priceKes || order.price || 0,
    // createdAt for display; scheduledDate is the real move/delivery date
    date: new Date(order.createdAt).toLocaleDateString(),
    time: new Date(order.createdAt).toLocaleTimeString(),
    scheduledDate: order.scheduledDate || order.createdAt, // relocations have scheduledDate
    duration: '—',
    customer: order.client?.fullName || 'Customer',
    customerPhone: order.client?.phone || '',
    customerEmail: order.client?.email || '',
    vehicleType: order.vehicleType || '',
    serviceType: order.serviceType || 'Standard',
    notes: order.notes || '',
    // relocation-specific
    estimatedVolume: order.estimatedVolume || '',
    itemsDescription: order.itemsDescription || '',
  });

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getDriverDashboard();

      if (typeof dashboardData.driver?.isOnline === 'boolean') {
        setIsOnline(dashboardData.driver.isOnline);
        if (dashboardData.driver.isOnline && gpsStatus === 'idle') startGPSTracking();
      }

      const assigned = (dashboardData.pendingOrders || []).map(o => transformOrder(o));
      const completed = (dashboardData.completedOrders || []).map(o => transformOrder(o));

      let nearbyOrders = [];
      try { const n = await getNearbyOrders(); nearbyOrders = (n.orders || []).map(o => transformOrder(o)); } catch (_) {}

      let nearbyRelocs = [];
      try {
        const nr = await getNearbyRelocations();
        nearbyRelocs = (nr.requests || []).map(r => transformOrder(r, 'relocation'));
        setAvailableRelocCount(nr.requests?.filter(r => r.status === 'pending').length || 0);
      } catch (_) {}

      let myOrders = [];
      try { const mo = await getDriverMyOrders(); myOrders = (Array.isArray(mo) ? mo : []).map(o => transformOrder(o)); } catch (_) {}

      const all = [...assigned, ...myOrders, ...completed, ...nearbyOrders, ...nearbyRelocs];
      const seen = new Set();
      setTrips(all.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; }));

      const profileData = await getDriverProfile();
      const p = {
        name: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        licence: profileData.licenseNumber || '',
        vehicle: dashboardData.driver?.vehicleType || '',
        county: profileData.address?.county || '',
      };
      setProfile(p);
      setEditForm(p);
      setDocs([]);
    } catch (err) {
      console.error('Driver data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDriverData(); }, []); // eslint-disable-line

  // ── Trip actions ───────────────────────────────────────────────────────────

  const updateTripStatus = async (id, status) => {
    try {
      const backendStatus = status === 'active' ? 'in-transit' : status === 'completed' ? 'delivered' : status;
      await updateOrderStatusDriver(id, backendStatus);
      setTrips(ts => ts.map(t => t.id === id ? { ...t, status, rawStatus: backendStatus } : t));
      setPanel(p => ({ ...p, trip: { ...p.trip, status } }));
      toast(`Trip marked as ${status}`);
    } catch (err) { toast(err.message || 'Error updating trip status', 'error'); }
  };

  const handleAcceptOrder = async (trip) => {
    try {
      if (trip.type === 'relocation') await acceptRelocationDriver(trip.id);
      else await acceptOrderDriver(trip.id);
      toast('Order accepted!');
      await fetchDriverData();
    } catch (err) { toast(err.message || 'Error accepting order', 'error'); }
  };

  const saveProfile = async () => {
    try {
      await updateDriverProfile({
        fullName: editForm.name, email: editForm.email, phone: editForm.phone,
        licenseNumber: editForm.licence, vehicleDetails: editForm.vehicle, county: editForm.county,
      });
      setProfile({ ...editForm });
      setEditProf(false);
      toast('Profile saved');
    } catch (err) { toast('Error saving profile', 'error'); }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const completedTrips = trips.filter(t => t.status === 'completed');
  const totalEarnings = completedTrips.reduce((a, t) => a + t.amount, 0);
  const activeTrip = trips.find(t => t.status === 'active');
  const pendingTrips = trips.filter(t => t.status === 'pending').length;
  const expiringDocs = docs.filter(d => d.status === 'expiring').length;

  const filtTrips = trips.filter(t => {
    const matchFilter = tripFilter === 'all' || t.status === tripFilter;
    const q = tripSearch.toLowerCase();
    const matchSearch = !q || t.tripId.toLowerCase().includes(q) || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Schedule: all jobs the driver should track ─────────────────────────────
  // Includes: active deliveries, accepted (assigned) relocations, pending trips.
  // Each item carries scheduledDate so the SchedulePage can group by move date.
  const SCHEDULE = trips.filter(t =>
    ['active', 'pending', 'completed'].includes(t.status)
  );

  const pageLabels = { overview: 'Overview', trips: 'My Trips', schedule: 'Schedule', relocations: 'Available Relocations', documents: 'Documents', earnings: 'Earnings', profile: 'My Profile' };

  if (loading) {
    return (
      <div className="dp-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading driver dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-root">
      <Sidebar
        page={page}
        setPage={setPage}
        profile={profile}
        setLogoutModal={setLogoutModal}
        pendingTrips={pendingTrips}
        expiringDocs={expiringDocs}
        isOnline={isOnline}
        availableRelocCount={availableRelocCount}
      />

      <div className="dp-main">
        {/* Topbar */}
        <div className="dp-topbar">
          <div className="dp-topbar-title">{pageLabels[page] || page}</div>
          {gpsStatus === 'tracking' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: '#059669', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
              GPS Live
            </div>
          )}
          {gpsStatus === 'denied' && <div style={{ fontSize: '.72rem', color: '#dc2626', fontWeight: 600 }}>⚠️ GPS denied</div>}
          <button
            onClick={handleToggleOnline}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 999, border: 'none',
              background: isOnline ? '#dcfce7' : '#f1f5f9',
              color: isOnline ? '#15803d' : '#64748b',
              fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: isOnline ? '#22c55e' : '#94a3b8', display: 'inline-block' }} />
            {isOnline ? 'Online' : 'Go Online'}
          </button>
        </div>

        {!isOnline && (
          <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', padding: '10px 28px', fontSize: '.82rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span>
            <span>You're offline. Go online to receive orders and see available relocation jobs.</span>
          </div>
        )}

        <OverviewPage active={page === 'overview'} trips={trips} activeTrip={activeTrip} pendingTrips={pendingTrips} completedTrips={completedTrips} totalEarnings={totalEarnings} setPage={setPage} setPanel={setPanel} SCHEDULE={SCHEDULE} />
        <TripsPage active={page === 'trips'} filtTrips={filtTrips} tripSearch={tripSearch} setTripSearch={setTripSearch} tripFilter={tripFilter} setTripFilter={setTripFilter} setPanel={setPanel} />
        <SchedulePage active={page === 'schedule'} SCHEDULE={SCHEDULE} setPanel={setPanel} />
        <EarningsPage active={page === 'earnings'} totalEarnings={totalEarnings} completedTrips={completedTrips} />
        <DocumentsPage active={page === 'documents'} docs={docs} toast={toast} />
        <ProfilePage active={page === 'profile'} profile={profile} editProf={editProf} setEditProf={setEditProf} editForm={editForm} setEditForm={setEditForm} saveProfile={saveProfile} completedTrips={completedTrips} pendingTrips={pendingTrips} totalEarnings={totalEarnings} docs={docs} toast={toast} />

        {/* ── Available Relocations (self-dispatch) ── */}
        <AvailableRelocations
          active={page === 'relocations'}
          toast={toast}
          isOnline={isOnline}
          onAccepted={fetchDriverData}
        />
      </div>

      <TripPanel panel={panel} setPanel={setPanel} trips={trips} updateTripStatus={updateTripStatus} handleAcceptOrder={handleAcceptOrder} />
      <LogoutModal logoutModal={logoutModal} setLogoutModal={setLogoutModal} toast={toast} />
      <Toast toasts={toasts} />
    </div>
  );
}