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
import UserPanel from '../../components/admin/UserPanel';
import TripPanel from '../../components/admin/TripPanel';
import UserModal from '../../components/admin/UserModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LogoutModal from '../../components/admin/LogoutModal';
import Toast from '../../components/admin/ToastModal';

// Utils
import { nid } from '../../utils/utils';

/* ─── Seed Data ─── */
const SEED_USERS = [
  { id: 'u1', name: 'Sarah Wambui', email: 'sarah@vaultspace.co.ke', role: 'owner', status: 'active', phone: '+254 722 890 123', joined: '2023-01-15', properties: 3, units: 14 },
  { id: 'u2', name: 'David Otieno', email: 'd.otieno@vaultspace.co.ke', role: 'driver', status: 'active', phone: '+254 711 234 567', joined: '2023-03-20', trips: 42, vehicle: 'KBZ 456T' },
  { id: 'u3', name: 'James Kariuki', email: 'james.k@gmail.com', role: 'owner', status: 'active', phone: '+254 712 111 222', joined: '2023-06-01', properties: 1, units: 4 },
  { id: 'u4', name: 'Grace Njeri', email: 'grace.n@gmail.com', role: 'owner', status: 'suspended', phone: '+254 701 777 888', joined: '2024-02-10', properties: 2, units: 8 },
  { id: 'u5', name: 'Amina Hassan', email: 'amina.h@vaultspace.co.ke', role: 'driver', status: 'pending', phone: '+254 733 445 566', joined: '2026-01-05', trips: 0, vehicle: 'KCA 200Z' },
  { id: 'u6', name: 'Peter Mwenda', email: 'peter.m@gmail.com', role: 'owner', status: 'active', phone: '+254 733 555 666', joined: '2024-01-01', properties: 1, units: 3 },
];

const SEED_TRIPS = [
  { id: 't1', tripId: 'TRP-001', driver: 'David Otieno', status: 'active', from: 'Wilson Airport', to: 'Mombasa Road Warehouse', amount: 12500, date: '2026-02-22' },
  { id: 't2', tripId: 'TRP-002', driver: 'David Otieno', status: 'pending', from: 'Kilimani Centre', to: 'Westlands Industrial', amount: 6800, date: '2026-02-22' },
  { id: 't3', tripId: 'TRP-003', driver: 'Amina Hassan', status: 'completed', from: 'Industrial Area', to: 'Roysambu Depot', amount: 18400, date: '2026-02-21' },
  { id: 't4', tripId: 'TRP-004', driver: 'David Otieno', status: 'completed', from: 'Westlands', to: 'Karen, Nairobi', amount: 4200, date: '2026-02-20' },
  { id: 't5', tripId: 'TRP-005', driver: 'Amina Hassan', status: 'cancelled', from: 'CBD Pickup Point', to: 'Gigiri', amount: 3100, date: '2026-02-19' },
];

const SEED_PROPS = [
  { id: 'p1', name: 'Westlands Industrial Units', owner: 'Sarah Wambui', units: 4, occupied: 2, revenue: 36000, status: 'active' },
  { id: 'p2', name: 'Kilimani Storage Centre', owner: 'Sarah Wambui', units: 3, occupied: 2, revenue: 25500, status: 'active' },
  { id: 'p3', name: 'Mombasa Road Warehouse', owner: 'James Kariuki', units: 2, occupied: 2, revenue: 104000, status: 'active' },
  { id: 'p4', name: 'Thika Road Mini-Storage', owner: 'Grace Njeri', units: 5, occupied: 0, revenue: 0, status: 'inactive' },
];

const ALERTS = [
  { type: 'critical', icon: '🚨', title: 'Grace Njeri account suspended', desc: 'Account flagged for overdue payments — 3 invoices outstanding.', time: '1h ago' },
  { type: 'warning', icon: '⚠️', title: 'Amina Hassan pending verification', desc: 'New driver registration awaiting document review and approval.', time: '3h ago' },
  { type: 'warning', icon: '⚠️', title: 'Thika Road Mini-Storage has 0% occupancy', desc: '5 units vacant for over 30 days. Owner may need outreach.', time: 'Yesterday' },
  { type: 'info', icon: 'ℹ️', title: 'System backup completed', desc: 'Nightly backup ran successfully. All data secured offsite.', time: '2 days ago' },
];

export default function AdminLayout() {
  const [users, setUsers] = useState(SEED_USERS);
  const [trips, setTrips] = useState(SEED_TRIPS);
  const [props, setProps] = useState(SEED_PROPS);
  const [page, setPage] = useState('overview');
  const [toasts, setToasts] = useState([]);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Fatuma Abdi',
    email: 'f.abdi@vaultspace.co.ke',
    phone: '+254 720 000 001',
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

  const toast = (msg, type = 'success') => {
    const id = nid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

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

  const saveProfile = () => {
    setAdminProfile({ ...editForm });
    setEditProf(false);
    toast('Profile saved');
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