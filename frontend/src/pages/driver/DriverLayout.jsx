import { useState, useEffect } from "react";
import  '../../styles/DriverDashboard.css';
import { nid } from '../../utils/utils';

// Components
import Sidebar from '../../components/driver/Sidebar';
import Topbar from '../../components/driver/Topbar';
import OverviewPage from '../../components/driver/OverviewPage';
import TripsPage from '../../components/driver/TripsPage';
import SchedulePage from '../../components/driver/SchedulePage';
import EarningsPage from '../../components/driver/EarningsPage';
import DocumentsPage from '../../components/driver/DocumentsPage';
import ProfilePage from '../../components/driver/ProfilePage';
import TripPanel from '../../components/driver/TripPanel';
import LogoutModal from '../../components/driver/LogoutModal';
import Toast from '../../components/driver/Toast';

/* ─── Seed Data ─── */
const SEED_TRIPS = [
  { id: 't1', tripId: 'TRP-001', status: 'active', from: 'Wilson Airport, Nairobi', to: 'Mombasa Road Warehouse', cargo: 'Electronics - 3 pallets', weight: '480 kg', amount: 12500, date: '2026-02-22', time: '08:30', duration: '2h 15m', customer: 'Safiri Logistics', notes: '' },
  { id: 't2', tripId: 'TRP-002', status: 'pending', from: 'Kilimani Storage Centre', to: 'Westlands Industrial', cargo: 'Furniture - 2 units', weight: '210 kg', amount: 6800, date: '2026-02-22', time: '13:00', duration: '45m', customer: 'James Kariuki', notes: 'Handle with care' },
  { id: 't3', tripId: 'TRP-003', status: 'completed', from: 'Industrial Area', to: 'Roysambu Depot', cargo: 'Auto parts - bulk', weight: '920 kg', amount: 18400, date: '2026-02-21', time: '09:00', duration: '1h 50m', customer: 'BuildMart Ltd', notes: '' },
  { id: 't4', tripId: 'TRP-004', status: 'completed', from: 'Westlands', to: 'Karen, Nairobi', cargo: 'Office supplies', weight: '120 kg', amount: 4200, date: '2026-02-20', time: '14:30', duration: '55m', customer: 'Grace Njeri', notes: '' },
  { id: 't5', tripId: 'TRP-005', status: 'cancelled', from: 'CBD Pickup Point', to: 'Gigiri', cargo: 'Perishables', weight: '80 kg', amount: 3100, date: '2026-02-19', time: '07:00', duration: '—', customer: 'Peter Mwenda', notes: 'Client cancelled' },
];

const SEED_DOCS = [
  { id: 'd1', name: 'Driving Licence', icon: '🪪', status: 'valid', expiry: '2028-03-15', issuer: 'NTSA Kenya' },
  { id: 'd2', name: 'Vehicle Inspection', icon: '🚛', status: 'valid', expiry: '2026-09-01', issuer: 'KEBS' },
  { id: 'd3', name: 'Goods in Transit Insurance', icon: '📋', status: 'expiring', expiry: '2026-04-10', issuer: 'Jubilee Insurance' },
  { id: 'd4', name: 'PSV Badge', icon: '🏷️', status: 'valid', expiry: '2027-01-20', issuer: 'NTSA Kenya' },
];

const SCHEDULE = [
  { time: '08:30', ampm: 'AM', title: 'TRP-001 · Pick-up', detail: 'Wilson Airport → Mombasa Road Warehouse', filled: true, pill: { cls: 'dp-pill-active', label: 'Active' } },
  { time: '01:00', ampm: 'PM', title: 'TRP-002 · Standby', detail: 'Kilimani Storage Centre → Westlands Industrial', filled: false, pill: { cls: 'dp-pill-pending', label: 'Pending' } },
  { time: '04:00', ampm: 'PM', title: 'Vehicle Check-in', detail: 'Return to base depot — Ruaraka', filled: false, pill: null },
];

export default function DriverLayout() {
  const [trips, setTrips] = useState(SEED_TRIPS);
  const [docs, setDocs] = useState(SEED_DOCS);
  const [page, setPage] = useState('overview');
  const [toasts, setToasts] = useState([]);
  const [profile, setProfile] = useState({ 
    name: 'David Otieno', 
    email: 'd.otieno@vaultspace.co.ke', 
    phone: '+254 711 234 567', 
    licence: 'DL-KE-2028-09284', 
    vehicle: 'KBZ 456T — Isuzu NQR', 
    county: 'Nairobi' 
  });
  const [editProf, setEditProf] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [tripFilter, setTripFilter] = useState('all');
  const [tripSearch, setTripSearch] = useState('');
  const [panel, setPanel] = useState({ open: false, trip: null });
  const [logoutModal, setLogoutModal] = useState(false);

  const toast = (msg, type = 'success') => {
    const id = nid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

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

  const pageLabels = { 
    overview: 'Overview', 
    trips: 'My Trips', 
    schedule: 'Schedule', 
    documents: 'Documents', 
    earnings: 'Earnings', 
    profile: 'My Profile' 
  };

  const updateTripStatus = (id, status) => {
    setTrips(ts => ts.map(t => t.id === id ? { ...t, status } : t));
    setPanel(p => ({ ...p, trip: { ...p.trip, status } }));
    toast(`Trip marked as ${status}`);
  };

  const saveProfile = () => {
    setProfile({ ...editForm });
    setEditProf(false);
    toast('Profile saved');
  };

  return (
    <div className="dp-root">
      <Sidebar
        page={page}
        setPage={setPage}
        profile={profile}
        setLogoutModal={setLogoutModal}
        pendingTrips={pendingTrips}
        expiringDocs={expiringDocs}
      />

      <div className="dp-main">
        <Topbar page={page} pageLabels={pageLabels} />

        <OverviewPage
          active={page === 'overview'}
          trips={trips}
          activeTrip={activeTrip}
          pendingTrips={pendingTrips}
          completedTrips={completedTrips}
          totalEarnings={totalEarnings}
          setPage={setPage}
          setPanel={setPanel}
          SCHEDULE={SCHEDULE}
        />

        <TripsPage
          active={page === 'trips'}
          filtTrips={filtTrips}
          tripSearch={tripSearch}
          setTripSearch={setTripSearch}
          tripFilter={tripFilter}
          setTripFilter={setTripFilter}
          setPanel={setPanel}
        />

        <SchedulePage
          active={page === 'schedule'}
          SCHEDULE={SCHEDULE}
        />

        <EarningsPage
          active={page === 'earnings'}
          totalEarnings={totalEarnings}
          completedTrips={completedTrips}
        />

        <DocumentsPage
          active={page === 'documents'}
          docs={docs}
          toast={toast}
        />

        <ProfilePage
          active={page === 'profile'}
          profile={profile}
          editProf={editProf}
          setEditProf={setEditProf}
          editForm={editForm}
          setEditForm={setEditForm}
          saveProfile={saveProfile}
          completedTrips={completedTrips}
          pendingTrips={pendingTrips}
          totalEarnings={totalEarnings}
          docs={docs}
          toast={toast}
        />
      </div>

      <TripPanel
        panel={panel}
        setPanel={setPanel}
        trips={trips}
        updateTripStatus={updateTripStatus}
      />

      <LogoutModal
        logoutModal={logoutModal}
        setLogoutModal={setLogoutModal}
        toast={toast}
      />

      <Toast toasts={toasts} />
    </div>
  );
}