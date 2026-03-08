import { useState, useEffect } from "react";
import '../../styles/AdminDashboard.css';

// Components
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import OverviewPage from '../../components/admin/OverviewPage';
import UsersPage from '../../components/admin/UsersPage';
import TripsPage from '../../components/admin/TripsPage';
import OrdersPage from '../../components/admin/OrdersPage';
import PropertiesPage from '../../components/admin/PropertiesPage';
import AlertsPage from '../../components/admin/AlertsPage';
import SettingsPage from '../../components/admin/SettingsPage';
import ProfilePage from '../../components/admin/ProfilePage';
import DriversMapPage from '../../components/admin/DriversMapPage';
import UserPanel from '../../components/admin/UserPanel';
import TripPanel from '../../components/admin/TripPanel';
import OrderPanel from '../../components/admin/OrderPanel';
import UserModal from '../../components/admin/UserModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LogoutModal from '../../components/admin/LogoutModal';
import Toast from '../../components/admin/ToastModal';

// API
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminOrders,
  getAdminProperties,
  getAdminDrivers,
  assignOrder,
  updateAdminOrderStatus,
  getMe,
  updateMe
} from '../../api';

// Utils
import { nid } from '../../utils/utils';

export default function AdminLayout() {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [orders, setOrders] = useState([]);   // ← full orders list for Orders page
  const [drivers, setDrivers] = useState([]); // ← for driver assignment dropdown
  const [props, setProps] = useState([]);
  const [page, setPage] = useState('overview');

  const pageLabels = {
    overview: 'Overview',
    users: 'Users',
    trips: 'Trips',
    orders: 'Orders',
    properties: 'Properties',
    driversmap: 'Drivers Map',
    alerts: 'Alerts',
    settings: 'Settings',
    profile: 'Profile'
  };

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'System Administrator',
    access: 'Full Access'
  });

  const [editProf, setEditProf] = useState(false);
  const [editForm, setEditForm] = useState({ ...adminProfile });
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [tripSearch, setTripSearch] = useState('');
  const [tripFilter, setTripFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [propSearch, setPropSearch] = useState('');
  const [panel, setPanel] = useState({ open: false, type: null, data: null });
  const [userModal, setUserModal] = useState({ open: false, mode: 'add', data: {} });
  const [confirm, setConfirm] = useState({ open: false, title: '', desc: '', icon: '', onOk: () => { } });
  const [logoutModal, setLogoutModal] = useState(false);
  const [settings, setSettings] = useState({
    maintenance: false,
    registrations: true,
    notifications: true,
    auditLog: true,
    twoFactor: false,
    autoBackup: true
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Dashboard
      await getAdminDashboard();

      // Users
      const usersData = await getAdminUsers();
      const transformedUsers = (usersData.data || []).map(user => ({
        id: user._id,
        name: user.fullName || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        phone: user.phone || '',
        joined: new Date(user.createdAt).toLocaleDateString(),
        trips: user.totalTrips || 0,
        vehicle: user.vehicleDetails || ''
      }));
      setUsers(transformedUsers);

      // Orders / Trips
      const ordersData = await getAdminOrders(1, 100);
      const rawOrders = ordersData.data || [];

      // Transform for OrdersPage (detailed view)
      const transformedOrders = rawOrders.map(order => ({
        id: order._id,
        shortId: order._id?.slice(-8)?.toUpperCase(),
        clientName: order.client?.fullName || 'Unknown',
        clientEmail: order.client?.email || '',
        clientPhone: order.client?.phone || '',
        driverName: order.driver?.user?.fullName || 'Unassigned',
        driverId: order.driver?._id || null,
        from: order.pickupAddress || '',
        to: order.dropoffAddress || '',
        recipientName: order.recipientName || '',
        recipientPhone: order.recipientPhone || '',
        vehicleType: order.vehicleType || '',
        serviceType: order.serviceType || 'Standard',
        distanceKm: order.distanceKm || 0,
        weightKg: order.packageWeightKg || 0,
        amount: order.priceKes || 0,
        status: order.status || 'pending',
        date: new Date(order.createdAt).toLocaleDateString(),
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : null,
      }));
      setOrders(transformedOrders);

      // Also keep trips format for TripsPage
      const transformedTrips = rawOrders.map(order => ({
        id: order._id,
        tripId: order._id?.slice(-8)?.toUpperCase(),
        driver: order.driver?.user?.fullName || 'Unassigned',
        status: order.status === 'in-transit' ? 'active'
          : order.status === 'delivered' ? 'completed'
            : order.status || 'pending',
        from: order.pickupAddress || '',
        to: order.dropoffAddress || '',
        amount: order.priceKes || 0,
        customer: order.client?.fullName || 'Unknown',
        date: new Date(order.createdAt).toLocaleDateString()
      }));
      setTrips(transformedTrips);

      // Properties
      const propsData = await getAdminProperties();
      const transformedProps = (propsData.data || []).map(prop => ({
        id: prop._id,
        name: prop.name || '',
        owner: prop.landlord?.fullName || 'Unknown',
        units: prop.totalUnits || 0,
        occupied: prop.occupiedUnits || 0,
        revenue: prop.monthlyRevenue || 0,
        status: prop.status || 'active'
      }));
      setProps(transformedProps);

      // Drivers (for order assignment)
      try {
        const driversData = await getAdminDrivers();
        const driverList = Array.isArray(driversData) ? driversData : (driversData.data || []);
        setDrivers(driverList.map(d => ({
          id: d._id,
          name: d.user?.fullName || 'Driver',
          vehicleType: d.vehicleType || '',
          isOnline: d.isOnline,
        })));
      } catch (_) { /* non-fatal */ }

      // Admin profile
      const adminData = await getMe();
      const profile = {
        name: adminData.fullName || '',
        email: adminData.email || '',
        phone: adminData.phone || '',
        role: 'System Administrator',
        access: 'Full Access'
      };
      setAdminProfile(profile);
      setEditForm(profile);

    } catch (err) {
      setError(err.message || 'Failed to load admin data');
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toast = (msg, type = 'success') => {
    const id = nid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  // ── Order management handlers ──────────────────────────────────────────────

  const handleAssignOrder = async (orderId, driverId) => {
    try {
      await assignOrder(orderId, driverId);
      toast('Driver assigned successfully');
      // Update local state optimistically
      const driver = drivers.find(d => d.id === driverId);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, driverId, driverName: driver?.name || 'Driver', status: 'assigned' } : o
      ));
      setPanel(p => ({ ...p, data: { ...p.data, driverId, driverName: driver?.name || 'Driver', status: 'assigned' } }));
    } catch (err) {
      toast(err.message || 'Failed to assign driver', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateAdminOrderStatus(orderId, status);
      toast(`Order status updated to ${status}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setPanel(p => ({ ...p, data: { ...p.data, status } }));
    } catch (err) {
      toast(err.message || 'Failed to update status', 'error');
    }
  };

  // ── User management ────────────────────────────────────────────────────────
  const updateUserStatus = (userId, newStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast(`User status updated to ${newStatus}`);
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast('User deleted');
  };

  const saveUser = (userData) => {
    if (userModal.mode === 'add') {
      setUsers(prev => [...prev, { id: nid(), ...userData, status: 'active', joined: new Date().toLocaleDateString(), trips: 0 }]);
      toast('User added');
    } else {
      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
      toast('User updated');
    }
  };

  const saveProfile = async () => {
    try {
      await updateMe({ fullName: editForm.name, email: editForm.email, phone: editForm.phone });
      setAdminProfile({ ...adminProfile, ...editForm });
      setEditProf(false);
      toast('Profile updated');
    } catch (err) {
      toast(err.message || 'Failed to update profile', 'error');
    }
  };

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filtUsers = users.filter(u => {
    const matchSearch = !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter = userFilter === 'all' || u.role === userFilter || u.status === userFilter;
    return matchSearch && matchFilter;
  });

  const filtTrips = trips.filter(t => {
    const matchSearch = !tripSearch ||
      t.tripId.toLowerCase().includes(tripSearch.toLowerCase()) ||
      t.driver.toLowerCase().includes(tripSearch.toLowerCase());
    const matchFilter = tripFilter === 'all' || t.status === tripFilter;
    return matchSearch && matchFilter;
  });

  const filtOrders = orders.filter(o => {
    const matchSearch = !orderSearch ||
      o.shortId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.clientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.driverName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchFilter = orderFilter === 'all' || o.status === orderFilter;
    return matchSearch && matchFilter;
  });

  const filtProps = props.filter(p => {
    const matchSearch = !propSearch ||
      p.name.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.owner.toLowerCase().includes(propSearch.toLowerCase());
    return matchSearch;
  });

  const totalRevenue = trips.reduce((s, t) => s + (t.amount || 0), 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const activeTrips = trips.filter(t => t.status === 'active').length;

  const ALERTS = [
    { type: 'critical', icon: '🚨', title: 'System check required', desc: 'Some deliveries pending assignment.', time: '1h ago' },
    { type: 'warning', icon: '⚠️', title: 'User verification pending', desc: 'New user registrations awaiting review.', time: '3h ago' },
    { type: 'info', icon: 'ℹ️', title: 'System backup completed', desc: 'Nightly backup ran successfully.', time: '5h ago' },
  ];

  if (loading) {
    return (
      <div className="ap-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading admin dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-layout">
      <Sidebar
        page={page}
        setPage={setPage}
        adminProfile={adminProfile}
        setLogoutModal={setLogoutModal}
        pendingUsers={pendingUsers}
        activeTrips={activeTrips}
        criticalAlerts={ALERTS.filter(a => a.type === 'critical').length}
      />

      <div className="ap-main">
        <Topbar
          page={page}
          pageLabels={pageLabels}
          adminProfile={adminProfile}
          setPage={setPage}
          setLogoutModal={setLogoutModal}
          error={error}
        />

        <div className="ap-content">
          <OverviewPage
            active={page === 'overview'}
            users={users}
            trips={trips}
            props={props}
            totalRevenue={totalRevenue}
            activeUsers={activeUsers}
            pendingUsers={pendingUsers}
            setPage={setPage}
            setPanel={setPanel}
          />

          <UsersPage
            active={page === 'users'}
            filtUsers={filtUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            setPanel={setPanel}
            setUserModal={setUserModal}
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

          {/* ── Orders Page (newly wired in) ── */}
          <OrdersPage
            active={page === 'orders'}
            filtOrders={filtOrders}
            orderSearch={orderSearch}
            setOrderSearch={setOrderSearch}
            orderFilter={orderFilter}
            setOrderFilter={setOrderFilter}
            setPanel={setPanel}
          />

          <PropertiesPage
            active={page === 'properties'}
            filtProps={filtProps}
            propSearch={propSearch}
            setPropSearch={setPropSearch}
            setPanel={setPanel}
          />

          <DriversMapPage active={page === 'driversmap'} />

          <AlertsPage
            active={page === 'alerts'}
            ALERTS={ALERTS}
            toast={toast}
          />

          <SettingsPage
            active={page === 'settings'}
            settings={settings}
            setSettings={setSettings}
            toast={toast}
          />

          <ProfilePage
            active={page === 'profile'}
            adminProfile={adminProfile}
            editProf={editProf}
            setEditProf={setEditProf}
            editForm={editForm}
            setEditForm={setEditForm}
            saveProfile={saveProfile}
            toast={toast}
            users={users}
            props={props}
            trips={trips}
            ALERTS={ALERTS}
          />
        </div>
      </div>

      {/* Panels */}
      <UserPanel
        panel={panel}
        setPanel={setPanel}
        users={users}
        updateUserStatus={updateUserStatus}
        setUserModal={setUserModal}
        setConfirm={setConfirm}
        deleteUser={deleteUser}
      />

      <TripPanel
        panel={panel}
        setPanel={setPanel}
        trips={trips}
      />

      {/* ── Order Panel (assign driver, update status) ── */}
      <OrderPanel
        panel={panel}
        setPanel={setPanel}
        orders={orders}
        drivers={drivers}
        onAssign={handleAssignOrder}
        onStatusUpdate={handleUpdateOrderStatus}
      />

      <UserModal
        userModal={userModal}
        setUserModal={setUserModal}
        saveUser={saveUser}
        toast={toast}
      />

      <ConfirmModal
        confirm={confirm}
        setConfirm={setConfirm}
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