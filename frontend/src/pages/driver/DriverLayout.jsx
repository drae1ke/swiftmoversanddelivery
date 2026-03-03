import { useState, useEffect } from "react";
import  '../../styles/DriverDashboard.css';
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

export default function DriverLayout() {
  const [trips, setTrips] = useState([]);
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState('overview');
  const { toasts, toast } = useLocalToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    licence: '', 
    vehicle: '', 
    county: '' 
  });
  
  const [editProf, setEditProf] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [tripFilter, setTripFilter] = useState('all');
  const [tripSearch, setTripSearch] = useState('');
  const [panel, setPanel] = useState({ open: false, trip: null });
  const [logoutModal, setLogoutModal] = useState(false);

  // Load driver data on mount
  useEffect(() => {
    fetchDriverData();
  }, []);

  const transformOrder = (order, type = 'delivery') => ({
    id: order._id,
    tripId: order._id?.slice(-8)?.toUpperCase() || order._id,
    type,
    status: order.status === 'assigned' ? 'active' : order.status === 'in-transit' ? 'active' : order.status === 'delivered' || order.status === 'completed' ? 'completed' : order.status || 'pending',
    rawStatus: order.status,
    from: order.pickupAddress || order.pickupAddress || '',
    to: order.dropoffAddress || order.destinationAddress || '',
    cargo: order.itemsDescription || `${order.packageWeightKg || ''}kg package`,
    weight: order.packageWeightKg ? `${order.packageWeightKg} kg` : order.estimatedVolume || 'N/A',
    amount: order.priceKes || order.price || 0,
    date: new Date(order.createdAt).toLocaleDateString(),
    time: new Date(order.createdAt).toLocaleTimeString(),
    duration: '—',
    customer: order.client?.fullName || 'Customer',
    customerPhone: order.client?.phone || '',
    customerEmail: order.client?.email || '',
    vehicleType: order.vehicleType || '',
    serviceType: order.serviceType || 'Standard',
    notes: order.notes || '',
    _raw: order,
  });

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch driver dashboard data
      const dashboardData = await getDriverDashboard();
      
      // Get assigned orders from dashboard
      const assignedTrips = (dashboardData.pendingOrders || []).map(o => transformOrder(o, 'delivery'));
      const completedTripsData = (dashboardData.completedOrders || []).map(o => transformOrder(o, 'delivery'));
      
      // Also try to fetch nearby available orders
      let nearbyTrips = [];
      try {
        const nearby = await getNearbyOrders();
        nearbyTrips = (nearby.orders || []).map(o => transformOrder(o, 'delivery'));
      } catch (e) {
        // Driver might not be online, that's fine
      }

      // Fetch nearby relocations too
      let nearbyRelocs = [];
      try {
        const nearbyR = await getNearbyRelocations();
        nearbyRelocs = (nearbyR.requests || []).map(r => transformOrder(r, 'relocation'));
      } catch (e) {
        // ignore
      }

      // Combine all trips, dedup by id
      const allTrips = [...assignedTrips, ...completedTripsData, ...nearbyTrips, ...nearbyRelocs];
      const seen = new Set();
      const deduped = allTrips.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      
      setTrips(deduped);
      
      // Fetch driver profile
      const profileData = await getDriverProfile();
      setProfile({
        name: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        licence: profileData.licenseNumber || '',
        vehicle: dashboardData.driver?.vehicleType || '',
        county: profileData.address?.county || ''
      });
      setEditForm({
        name: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        licence: profileData.licenseNumber || '',
        vehicle: dashboardData.driver?.vehicleType || '',
        county: profileData.address?.county || ''
      });
      
      // No mock documents
      setDocs([]);
    } catch (err) {
      setError(err.message || 'Failed to load driver data');
      console.error('Driver dashboard error:', err);
    } finally {
      setLoading(false);
    }
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

  const SCHEDULE = [
    ...(activeTrip ? [{ time: new Date(activeTrip.date).toLocaleTimeString(), ampm: '', title: `${activeTrip.tripId} · Active`, detail: `${activeTrip.from} → ${activeTrip.to}`, filled: true, pill: { cls: 'dp-pill-active', label: 'Active' } }] : []),
    ...trips.filter(t => t.status === 'pending').slice(0, 1).map(t => ({ time: new Date(t.date).toLocaleTimeString(), ampm: '', title: `${t.tripId} · Pending`, detail: `${t.from} → ${t.to}`, filled: false, pill: { cls: 'dp-pill-pending', label: 'Pending' } })),
  ];

  const pageLabels = { 
    overview: 'Overview', 
    trips: 'My Trips', 
    schedule: 'Schedule', 
    documents: 'Documents', 
    earnings: 'Earnings', 
    profile: 'My Profile' 
  };

  const updateTripStatus = async (id, status) => {
    try {
      await updateOrderStatusDriver(id, status === 'active' ? 'in-transit' : status === 'completed' ? 'delivered' : status);
      setTrips(ts => ts.map(t => t.id === id ? { ...t, status, rawStatus: status === 'active' ? 'in-transit' : status === 'completed' ? 'delivered' : status } : t));
      setPanel(p => ({ ...p, trip: { ...p.trip, status } }));
      toast(`Trip marked as ${status}`);
    } catch (err) {
      toast(err.message || 'Error updating trip status');
    }
  };

  const handleAcceptOrder = async (trip) => {
    try {
      if (trip.type === 'relocation') {
        await acceptRelocationDriver(trip.id);
      } else {
        await acceptOrderDriver(trip.id);
      }
      toast('Order accepted!');
      await fetchDriverData();
    } catch (err) {
      toast(err.message || 'Error accepting order');
    }
  };

  const saveProfile = async () => {
    try {
      await updateDriverProfile({
        fullName: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        licenseNumber: editForm.licence,
        vehicleDetails: editForm.vehicle,
        county: editForm.county
      });
      setProfile({ ...editForm });
      setEditProf(false);
      toast('Profile saved');
    } catch (err) {
      toast('Error saving profile');
      console.error('Save profile error:', err);
    }
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
        handleAcceptOrder={handleAcceptOrder}
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