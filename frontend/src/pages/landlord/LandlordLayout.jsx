import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/LandlordDashboard.css';
import { getInitials, formatNumber, COUNTIES } from '../../utils/utils';
import { useLocalToast } from '../../components/common/useLocalToast';
import { useAuth } from '../../context/AuthContext';
import {
  getMyProperties,
  createProperty as apiCreateProperty,
  updateProperty as apiUpdateProperty,
  deleteProperty as apiDeleteProperty,
  getMe,
  updateMe,
} from '../../api';

// Components
import Sidebar from '../../components/landlord/Sidebar';
import Topbar from '../../components/landlord/Topbar';
import OverviewPage from '../../components/landlord/OverviewPage';
import PropertiesPage from '../../components/landlord/PropertiesPage';
import ProfilePage from '../../components/landlord/ProfilePage';
import PropertyModal from '../../components/landlord/PropertyModal';
import ConfirmModal from '../../components/landlord/ConfirmModal';
import LogoutModal from '../../components/landlord/LogoutModal';
import Toast from '../../components/landlord/Toast';

/* ─── Transform backend property → UI format ─── */
function transformBackendProps(backendProps) {
  return (backendProps || []).map(p => ({
    // Identity
    id: p._id,
    // All real storage fields
    title: p.title,
    name: p.title,          // alias used in some legacy spots
    description: p.description,
    address: p.address,
    location: p.address,    // alias
    storageType: p.storageType,
    sizeSqFt: p.sizeSqFt,
    pricePerMonth: p.pricePerMonth,
    amenities: p.amenities || [],
    images: p.images || [],
    availability: p.availability,
    status: p.status,
    isVerified: p.isVerified,
    views: p.views || 0,
    createdAt: p.createdAt,
  }));
}

export default function LandlordLayout() {
  const [props, setProps] = useState([]);
  const [page, setPage] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toasts, toast } = useLocalToast();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast('Logged out');
    navigate('/Login');
  };

  // Profile
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', county: '', idNumber: ''
  });
  const [editProf, setEditProf] = useState(false);
  const [editProfForm, setEditProfForm] = useState({ ...profile });

  // Search / filter
  const [propSearch, setPropSearch] = useState('');
  const [storageTypeFilter, setStorageTypeFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Modals
  const [propMod, setPropMod] = useState({ open: false, mode: 'add', data: {} });
  const [confirm, setConfirm] = useState({ open: false, title: '', desc: '', onOk: () => {} });
  const [logoutMod, setLogoutMod] = useState(false);

  useEffect(() => {
    fetchLandlordData();
  }, []);

  const fetchLandlordData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [backendProps, me] = await Promise.all([
        getMyProperties(),
        getMe(),
      ]);

      setProps(transformBackendProps(Array.isArray(backendProps) ? backendProps : []));

      const prof = {
        name: me.fullName || '',
        email: me.email || '',
        phone: me.phone || '',
        county: me.address?.county || '',
        idNumber: me.idNumber || '',
      };
      setProfile(prof);
      setEditProfForm(prof);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Landlord dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived / Filtered ─── */
  const totalRevenue = props
    .filter(p => p.availability === 'available' || p.availability === 'reserved')
    .reduce((sum, p) => sum + (p.pricePerMonth || 0), 0);

  const filtProps = props.filter(p => {
    const q = propSearch.toLowerCase();
    const matchSearch = !q ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      (p.storageType || '').toLowerCase().includes(q);
    const matchType = storageTypeFilter === 'all' || p.storageType === storageTypeFilter;
    const matchAvail = availabilityFilter === 'all' || p.availability === availabilityFilter;
    return matchSearch && matchType && matchAvail;
  });

  /* ─── Property CRUD ─── */
  const openAddProp = () =>
    setPropMod({ open: true, mode: 'add', data: {} });

  const openEditProp = (p, e) => {
    e?.stopPropagation();
    setPropMod({ open: true, mode: 'edit', data: { ...p } });
  };

  const saveProp = async (d) => {
    try {
      const payload = {
        title: d.title,
        description: d.description,
        address: d.address,
        storageType: d.storageType,
        sizeSqFt: Number(d.sizeSqFt),
        pricePerMonth: Number(d.pricePerMonth),
        availability: d.availability,
        amenities: d.amenities || [],
        images: d.images || [],
      };

      if (propMod.mode === 'add') {
        await apiCreateProperty(payload);
        toast('Property created successfully');
      } else {
        await apiUpdateProperty(d.id, payload);
        toast('Property updated successfully');
      }
      await fetchLandlordData();
    } catch (err) {
      toast(err.message || 'Error saving property', 'error');
    }
    setPropMod(m => ({ ...m, open: false }));
  };

  const deleteProp = (p) =>
    setConfirm({
      open: true,
      title: 'Delete Property?',
      desc: `"${p.title || p.name}" will be permanently removed from your portfolio.`,
      onOk: async () => {
        try {
          await apiDeleteProperty(p.id);
          await fetchLandlordData();
          toast('Property deleted');
        } catch (err) {
          toast(err.message || 'Error deleting property', 'error');
        }
        setConfirm(c => ({ ...c, open: false }));
      },
    });

  /* ─── Profile ─── */
  const saveProfile = async () => {
    try {
      await updateMe({
        fullName: editProfForm.name,
        phone: editProfForm.phone,
        address: { county: editProfForm.county },
        idNumber: editProfForm.idNumber,
      });
      setProfile({ ...editProfForm });
      setEditProf(false);
      toast('Profile updated');
    } catch (err) {
      toast(err.message || 'Error updating profile', 'error');
    }
  };

  const pageLabels = {
    overview: 'Overview',
    properties: 'Properties',
    profile: 'My Profile',
  };

  if (loading) {
    return (
      <div className="op-shell">
        <div className="op-loading">
          <div className="op-spinner" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="op-root">
      <Sidebar
        page={page}
        setPage={setPage}
        profile={profile}
        setLogoutModal={setLogoutMod}
        props={props}
        availableCount={props.filter(p => p.availability === 'available').length}
        unavailableCount={props.filter(p => p.availability === 'unavailable').length}
      />

      <div className="op-main">
        <Topbar
          page={page}
          pageLabel={pageLabels[page] || page}
          profile={profile}
          onRefresh={fetchLandlordData}
        />

        {error && (
          <div className="op-error-bar">
            {error}
            <button onClick={fetchLandlordData}>Retry</button>
          </div>
        )}

        <OverviewPage
          active={page === 'overview'}
          props={props}
          filtProps={filtProps}
          totalRevenue={totalRevenue}
          openAddProp={openAddProp}
          setPage={setPage}
        />

        <PropertiesPage
          active={page === 'properties'}
          filtProps={filtProps}
          propSearch={propSearch}
          setPropSearch={setPropSearch}
          storageTypeFilter={storageTypeFilter}
          setStorageTypeFilter={setStorageTypeFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          openAddProp={openAddProp}
          openEditProp={openEditProp}
          deleteProp={deleteProp}
        />

        <ProfilePage
          active={page === 'profile'}
          profile={profile}
          editProf={editProf}
          setEditProf={setEditProf}
          editProfForm={editProfForm}
          setEditProfForm={setEditProfForm}
          saveProfile={saveProfile}
          props={props}
          totalRevenue={totalRevenue}
          toast={toast}
        />
      </div>

      <PropertyModal
        modal={propMod}
        onClose={() => setPropMod(m => ({ ...m, open: false }))}
        onSave={saveProp}
      />

      <ConfirmModal confirm={confirm} setConfirm={setConfirm} />

      <LogoutModal
        logoutMod={logoutMod}
        setLogoutMod={setLogoutMod}
        onConfirm={handleLogout}
      />

      <Toast toasts={toasts} />
    </div>
  );
}