import { useState, useEffect } from "react";
import '../../styles/AdminDashboard.css';

// Components
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import OverviewPage from '../../components/admin/OverviewPage';
import UsersPage from '../../components/admin/UsersPage';
import TripsPage from '../../components/admin/TripsPage';
import PropertiesPage from '../../components/admin/PropertiesPage';
import AlertsPage from '../../components/admin/AlertsPage';
import SettingsPage from '../../components/admin/SettingsPage';
import ProfilePage from '../../components/admin/ProfilePage';
import DriversMapPage from '../../components/admin/DriversMapPage';
import UserPanel from '../../components/admin/UserPanel';
import TripPanel from '../../components/admin/TripPanel';
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
  getMe,
  updateMe
} from '../../api';

// Utils
import { nid } from '../../utils/utils';

export default function AdminLayout() {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [props, setProps] = useState([]);
  const [page, setPage] = useState('overview');
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

  // Fetch admin data on mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard data
      const dashboardData = await getAdminDashboard();
      
      // Fetch users
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
      
      // Fetch orders/trips
      const ordersData = await getAdminOrders();
      const transformedTrips = (ordersData.data || []).map(order => {
        const driverName = order.driver?.user?.fullName || 'Unassigned';
        return {
          id: order._id,
          tripId: order._id?.slice(-8)?.toUpperCase() || order._id,
          driver: driverName,
          status: order.status || 'pending',
          from: order.pickupAddress || '',
          to: order.dropoffAddress || '',
          amount: order.priceKes || 0,
          customer: order.client?.fullName || 'Unknown',
          date: new Date(order.createdAt).toLocaleDateString()
        };
      });
      setTrips(transformedTrips);
      
      // Fetch properties
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
      
      // Fetch admin profile
      const adminData = await getMe();
      setAdminProfile({
        name: adminData.fullName || '',
        email: adminData.email || '',
        phone: adminData.phone || '',
        role: 'System Administrator',
        access: 'Full Access'
      });
      setEditForm({
        name: adminData.fullName || '',
        email: adminData.email || '',
        phone: adminData.phone || '',
        role: 'System Administrator',
        access: 'Full Access'
      });
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

  // Default alerts data (can be integrated with backend later)
  const ALERTS = [
    { type: 'critical', icon: '🚨', title: 'System check required', desc: 'Some deliveries pending assignment.', time: '1h ago' },
    { type: 'warning', icon: '⚠️', title: 'User verification pending', desc: 'New user registrations awaiting review.', time: '3h ago' },
    { type: 'info', icon: 'ℹ️', title: 'System backup completed', desc: 'Nightly backup ran successfully.', time: '2 days ago' },
  ];

  const totalRevenue = props.reduce((a, p) => a + p.revenue, 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  const filtUsers = users.filter(u => {
    const matchF = userFilter === 'all' || u.role === userFilter || u.status === userFilter;
    const q = userSearch.toLowerCase();
    return matchF && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  const filtTrips = trips.filter(t => {
    const matchF = tripFilter === 'all' || t.status === tripFilter;
    const q = tripSearch.toLowerCase();
    return matchF && (!q || t.tripId.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q));
  });

  const filtProps = props.filter(p => {
    const q = propSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
  });

  const pageLabels = {
    overview: 'Overview',
    users: 'Users',
    trips: 'Trips',
    properties: 'Properties',
    driversmap: 'Drivers Map',
    alerts: 'Alerts',
    settings: 'Settings',
    profile: 'Admin Profile'
  };

  const updateUserStatus = (id, status) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status } : u));
    setPanel(p => ({ ...p, data: { ...p.data, status } }));
    toast(`User ${status}`);
  };

  const deleteUser = (id) => {
    setUsers(us => us.filter(u => u.id !== id));
    setPanel(p => ({ ...p, open: false }));
    setConfirm(c => ({ ...c, open: false }));
    toast('User deleted', 'error');
  };

  const saveUser = (data) => {
    if (userModal.mode === 'add') {
      setUsers(us => [...us, {
        ...data,
        id: nid(),
        status: 'pending',
        joined: new Date().toISOString().split('T')[0]
      }]);
      toast('User added');
    } else {
      setUsers(us => us.map(u => u.id === data.id ? { ...u, ...data } : u));
      toast('User updated');
    }
    setUserModal(m => ({ ...m, open: false }));
  };

  const saveProfile = async () => {
    try {
      await updateMe({
        fullName: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      });
      setAdminProfile({ ...editForm });
      setEditProf(false);
      toast('Profile saved');
    } catch (err) {
      toast('Error saving profile', 'error');
    }
  };

  return (
    <div className="ap-root">
      <Sidebar
        page={page}
        setPage={setPage}
        adminProfile={adminProfile}
        setLogoutModal={setLogoutModal}
        pendingUsers={pendingUsers}
        activeTrips={trips.filter(t => t.status === 'active').length}
        criticalAlerts={ALERTS.filter(a => a.type === 'critical').length}
      />

      <div className="ap-main">
        <Topbar page={page} pageLabels={pageLabels} />

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
          users={users}
          filtUsers={filtUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          setPanel={setPanel}
          setUserModal={setUserModal}
          setConfirm={setConfirm}
          deleteUser={deleteUser}
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

        <PropertiesPage
          active={page === 'properties'}
          filtProps={filtProps}
          propSearch={propSearch}
          setPropSearch={setPropSearch}
        />

        <DriversMapPage active={page === 'driversmap'} />

        <AlertsPage active={page === 'alerts'} ALERTS={ALERTS} />

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