import { useState, useEffect } from "react";
import '../../styles/LandlordDashboard.css';
import { nid, getInitials, formatNumber, getPillClass, COUNTIES, ICONS, COLORS } from '../../utils/utils';
import { useLocalToast } from '../../components/common/useLocalToast';
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
import UnitsPage from '../../components/landlord/UnitsPage';
import LeasesPage from '../../components/landlord/LeasesPage';
import PaymentsPage from '../../components/landlord/PaymentPage';
import ProfilePage from '../../components/landlord/ProfilePage';
import UnitPanel from '../../components/landlord/UnitPanel';
import PropertyModal from '../../components/landlord/PropertyModal';
import UnitModal from '../../components/landlord/UnitModal';
import TenantModal from '../../components/landlord/TenantModal';
import PaymentModal from '../../components/landlord/PaymentModal';
import ConfirmModal from '../../components/landlord/ConfirmModal';
import LogoutModal from '../../components/landlord/LogoutModal';
import Toast from '../../components/landlord/Toast';

/* ─── Transform backend Property → UI format ─── */
const STORAGE_TYPE_MAP = {
  room: 'Standard', garage: 'Standard', warehouse: 'Warehouse',
  container: 'Large', basement: 'Medium', attic: 'Small', other: 'Standard',
};

function transformBackendProps(backendProps) {
  return backendProps.map((p, i) => ({
    id: p._id,
    icon: ICONS[i % ICONS.length],
    color: COLORS[i % COLORS.length],
    name: p.title,
    location: p.address,
    units: [{
      id: p._id,
      unitId: p.title,
      size: p.sizeSqFt || 0,
      type: STORAGE_TYPE_MAP[p.storageType] || 'Standard',
      status: p.availability === 'available' ? 'vacant' : 'occupied',
      price: p.pricePerMonth || 0,
      tenant: null,
      leaseEnd: '',
      notes: p.description || '',
    }],
  }));
}

export default function LandlordLayout() {
  const [props, setProps] = useState([]);
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toasts, toast } = useLocalToast();

  // Profile
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    county: '', 
    idNumber: '' 
  });
  const [editProf, setEditProf] = useState(false);
  const [editProfForm, setEditProfForm] = useState({ ...profile });

  // Search / filter state
  const [propSearch, setPropSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [leaseSearch, setLeaseSearch] = useState('');
  const [payFilter, setPayFilter] = useState('all');

  // Slide panel
  const [panel, setPanel] = useState({ open: false, unitId: null, propId: null });

  // Modals
  const [propMod, setPropMod] = useState({ open: false, mode: 'add', data: {} });
  const [unitMod, setUnitMod] = useState({ open: false, mode: 'add', propId: null, data: {} });
  const [tenantMod, setTenantMod] = useState({ open: false, unitId: null, propId: null });
  const [payMod, setPayMod] = useState({ open: false, mode: 'add', data: {} });
  const [confirm, setConfirm] = useState({ open: false, title: '', desc: '', icon: '⚠️', onOk: () => { } });
  const [logoutMod, setLogoutMod] = useState(false);

  // Fetch data from backend on mount
  useEffect(() => {
    fetchLandlordData();
  }, []);

  const fetchLandlordData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch properties
      const backendProps = await getMyProperties();
      setProps(transformBackendProps(Array.isArray(backendProps) ? backendProps : []));

      // Fetch profile
      const me = await getMe();
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

  /* Derived */
  const allUnits = props.flatMap(p => p.units.map(u => ({ ...u, propName: p.name, propId: p.id })));
  const totalUnits = allUnits.length;
  const totalOcc = allUnits.filter(u => u.status === 'occupied').length;
  const totalVac = allUnits.filter(u => u.status === 'vacant').length;
  const totalRev = allUnits.filter(u => u.status === 'occupied').reduce((a, u) => a + u.price, 0);

  const allLeases = allUnits.filter(u => u.tenant);

  const filtUnits = allUnits.filter(u => {
    const matchFilter = unitFilter === 'all' || u.status === unitFilter;
    const q = unitSearch.toLowerCase();
    return matchFilter && (!q || u.unitId.toLowerCase().includes(q) || u.propName.toLowerCase().includes(q) || u.type.toLowerCase().includes(q));
  });

  const filtLeases = allLeases.filter(u => {
    const q = leaseSearch.toLowerCase();
    return !q || u.tenant.name.toLowerCase().includes(q) || u.unitId.toLowerCase().includes(q) || u.propName.toLowerCase().includes(q);
  });

  const filtPayments = payments.filter(p => payFilter === 'all' || p.status === payFilter);
  const filtProps = props.filter(p => p.name.toLowerCase().includes(propSearch.toLowerCase()) || p.location.toLowerCase().includes(propSearch.toLowerCase()));

  /* Panel helpers */
  const getPanelUnit = () => {
    if (!panel.propId || !panel.unitId) return null;
    return props.find(p => p.id === panel.propId)?.units.find(u => u.id === panel.unitId) || null;
  };
  
  const getPanelProp = () => props.find(p => p.id === panel.propId);
  
  const closePanel = () => setPanel(p => ({ ...p, open: false }));

  const pageLabels = { 
    overview: 'Overview', 
    properties: 'Properties', 
    units: 'All Units', 
    leases: 'Leases', 
    payments: 'Payments', 
    profile: 'My Profile' 
  };

  /* ─── Property CRUD ─── */
  const openAddProp = () => setPropMod({ open: true, mode: 'add', data: { name: '', location: '', icon: '🏢', color: 'c0' } });
  
  const openEditProp = (p, e) => { 
    e?.stopPropagation(); 
    setPropMod({ open: true, mode: 'edit', data: { ...p } }); 
  };
  
  const saveProp = async d => {
    try {
      if (propMod.mode === 'add') {
        await apiCreateProperty({
          title: d.name,
          description: d.name,
          address: d.location,
          storageType: 'room',
          sizeSqFt: 20,
          pricePerMonth: 0,
        });
        toast('Property added');
      } else {
        await apiUpdateProperty(d.id, {
          title: d.name,
          address: d.location,
        });
        toast('Property updated');
      }
      await fetchLandlordData();
    } catch (err) {
      toast(err.message || 'Error saving property', 'error');
    }
    setPropMod(m => ({ ...m, open: false }));
  };
  
  const deleteProp = p => setConfirm({ 
    open: true, 
    icon: '🗑️', 
    title: 'Delete Property?', 
    desc: `"${p.name}" and all its units will be permanently removed.`, 
    onOk: async () => { 
      try {
        await apiDeleteProperty(p.id);
        await fetchLandlordData();
        toast('Property deleted', 'error');
      } catch (err) {
        toast(err.message || 'Error deleting property', 'error');
      }
      setConfirm(c => ({ ...c, open: false })); 
    } 
  });

  /* ─── Unit CRUD ─── */
  const openAddUnit = (propId, e) => { 
    e?.stopPropagation(); 
    setUnitMod({ 
      open: true, 
      mode: 'add', 
      propId, 
      data: { unitId: '', size: '', type: 'Small', status: 'vacant', price: '', leaseEnd: '', notes: '' } 
    }); 
  };
  
  const openEditUnit = (u, propId) => { 
    closePanel(); 
    setTimeout(() => setUnitMod({ open: true, mode: 'edit', propId, data: { ...u } }), 220); 
  };
  
  const saveUnit = d => {
    const clean = { ...d, price: Number(d.price), size: Number(d.size) || d.size };
    if (unitMod.mode === 'add') {
      setProps(ps => ps.map(p => p.id === unitMod.propId ? { ...p, units: [...p.units, { ...clean, id: nid(), tenant: null }] } : p));
      toast('Unit added');
    } else {
      setProps(ps => ps.map(p => p.id === unitMod.propId ? { ...p, units: p.units.map(u => u.id === clean.id ? { ...u, ...clean } : u) } : p));
      toast('Unit updated');
    }
    setUnitMod(m => ({ ...m, open: false }));
  };
  
  const deleteUnit = (u, propId) => setConfirm({ 
    open: true, 
    icon: '🗑️', 
    title: 'Delete Unit?', 
    desc: `Unit "${u.unitId}" will be permanently removed.`, 
    onOk: () => { 
      setProps(ps => ps.map(p => p.id === propId ? { ...p, units: p.units.filter(x => x.id !== u.id) } : p)); 
      toast('Unit deleted', 'error'); 
      closePanel(); 
      setConfirm(c => ({ ...c, open: false })); 
    } 
  });

  /* ─── Tenant CRUD ─── */
  const openAssignTenant = (u, propId) => { 
    closePanel(); 
    setTimeout(() => setTenantMod({ open: true, unitId: u.id, propId, form: { name: '', phone: '', since: '', leaseEnd: '' } }), 220); 
  };
  
  const saveTenant = (form, unitId, propId) => {
    const tenant = { 
      name: form.name, 
      initials: getInitials(form.name), 
      phone: form.phone, 
      since: form.since 
    };
    setProps(ps => ps.map(p => p.id === propId ? { 
      ...p, 
      units: p.units.map(u => u.id === unitId ? { ...u, tenant, status: 'occupied', leaseEnd: form.leaseEnd } : u) 
    } : p));
    toast('Tenant assigned');
    setTenantMod(m => ({ ...m, open: false }));
  };
  
  const removeTenant = (u, propId) => setConfirm({ 
    open: true, 
    icon: '👤', 
    title: 'Remove Tenant?', 
    desc: `${u.tenant?.name} will be removed and unit set to vacant.`, 
    onOk: () => { 
      setProps(ps => ps.map(p => p.id === propId ? { 
        ...p, 
        units: p.units.map(x => x.id === u.id ? { ...x, tenant: null, status: 'vacant', leaseEnd: '' } : x) 
      } : p)); 
      toast('Tenant removed', 'error'); 
      setConfirm(c => ({ ...c, open: false })); 
    } 
  });

  /* ─── Payment CRUD ─── */
  const savePayment = d => {
    if (payMod.mode === 'add') { 
      setPayments(ps => [...ps, { ...d, id: nid(), amount: Number(d.amount) }]); 
      toast('Payment recorded'); 
    } else { 
      setPayments(ps => ps.map(p => p.id === d.id ? { ...p, ...d, amount: Number(d.amount) } : p)); 
      toast('Payment updated'); 
    }
    setPayMod(m => ({ ...m, open: false }));
  };
  
  const deletePayment = id => setConfirm({ 
    open: true, 
    icon: '🗑️', 
    title: 'Delete Payment?', 
    desc: 'This payment record will be permanently removed.', 
    onOk: () => { 
      setPayments(ps => ps.filter(p => p.id !== id)); 
      toast('Payment deleted', 'error'); 
      setConfirm(c => ({ ...c, open: false })); 
    } 
  });
  
  const markPaid = id => { 
    setPayments(ps => ps.map(p => p.id === id ? { ...p, status: 'paid' } : p)); 
    toast('Marked as paid'); 
  };

  const saveProfile = async () => {
    try {
      await updateMe({
        fullName: editProfForm.name,
        phone: editProfForm.phone,
        idNumber: editProfForm.idNumber,
        address: { county: editProfForm.county },
      });
      setProfile({ ...editProfForm });
      setEditProf(false);
      toast('Profile saved');
    } catch (err) {
      toast(err.message || 'Error saving profile', 'error');
    }
  };

  return (
    <div className="op-root">
      <Sidebar
        page={page}
        setPage={setPage}
        profile={profile}
        setLogoutModal={setLogoutMod}
        props={props}
        vacantUnits={totalVac}
        overduePayments={payments.filter(p => p.status === 'overdue').length}
      />

      <div className="op-main">
        <Topbar page={page} pageLabels={pageLabels} />

        <OverviewPage
          active={page === 'overview'}
          props={props}
          allUnits={allUnits}
          totalUnits={totalUnits}
          totalOcc={totalOcc}
          totalVac={totalVac}
          totalRev={totalRev}
          setPage={setPage}
          setPanel={setPanel}
        />

        <PropertiesPage
          active={page === 'properties'}
          filtProps={filtProps}
          propSearch={propSearch}
          setPropSearch={setPropSearch}
          openAddProp={openAddProp}
          openEditProp={openEditProp}
          deleteProp={deleteProp}
          openAddUnit={openAddUnit}
          setPage={setPage}
          setUnitSearch={setUnitSearch}
        />

        <UnitsPage
          active={page === 'units'}
          filtUnits={filtUnits}
          unitSearch={unitSearch}
          setUnitSearch={setUnitSearch}
          unitFilter={unitFilter}
          setUnitFilter={setUnitFilter}
          setPanel={setPanel}
          openEditUnit={openEditUnit}
          deleteUnit={deleteUnit}
        />

        <LeasesPage
          active={page === 'leases'}
          filtLeases={filtLeases}
          leaseSearch={leaseSearch}
          setLeaseSearch={setLeaseSearch}
          setPanel={setPanel}
          removeTenant={removeTenant}
        />

        <PaymentsPage
          active={page === 'payments'}
          filtPayments={filtPayments}
          payFilter={payFilter}
          setPayFilter={setPayFilter}
          setPayMod={setPayMod}
          markPaid={markPaid}
          deletePayment={deletePayment}
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
          totalUnits={totalUnits}
          totalOcc={totalOcc}
          totalVac={totalVac}
          totalRev={totalRev}
          toast={toast}
        />
      </div>

      <UnitPanel
        panel={panel}
        setPanel={setPanel}
        getPanelUnit={getPanelUnit}
        getPanelProp={getPanelProp}
        openEditUnit={openEditUnit}
        removeTenant={removeTenant}
        openAssignTenant={openAssignTenant}
        deleteUnit={deleteUnit}
        toast={toast}
      />

      <PropertyModal
        modal={propMod}
        onClose={() => setPropMod(m => ({ ...m, open: false }))}
        onSave={saveProp}
      />

      <UnitModal
        modal={unitMod}
        onClose={() => setUnitMod(m => ({ ...m, open: false }))}
        onSave={saveUnit}
      />

      <TenantModal
        modal={tenantMod}
        onClose={() => setTenantMod(m => ({ ...m, open: false }))}
        onSave={saveTenant}
      />

      <PaymentModal
        modal={payMod}
        onClose={() => setPayMod(m => ({ ...m, open: false }))}
        onSave={savePayment}
        allUnits={allUnits}
      />

      <ConfirmModal
        confirm={confirm}
        setConfirm={setConfirm}
      />

      <LogoutModal
        logoutMod={logoutMod}
        setLogoutMod={setLogoutMod}
        toast={toast}
      />

      <Toast toasts={toasts} />
    </div>
  );
}