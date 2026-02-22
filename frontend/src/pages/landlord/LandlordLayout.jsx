import { useState, useEffect } from "react";
import '../../styles/LandlordDashboard.css';
import { nid, getInitials, formatNumber, getPillClass, COUNTIES } from '../../utils/utils';

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

/* ─── Seed Data ─── */
const SEED_PROPS = [
  { 
    id: 'p1', icon: '🏭', color: 'c0', name: 'Westlands Industrial Units', location: 'Westlands, Nairobi', 
    units: [
      { id: 'u1', unitId: 'WIU-01', size: 20, type: 'Standard', status: 'occupied', price: 18000, 
        tenant: { name: 'James Kariuki', initials: 'JK', phone: '+254 712 111 222', since: '2024-03-01' }, 
        leaseEnd: '2026-02-01', notes: '' },
      { id: 'u2', unitId: 'WIU-02', size: 20, type: 'Standard', status: 'occupied', price: 18000, 
        tenant: { name: 'Amina Odhiambo', initials: 'AO', phone: '+254 722 333 444', since: '2024-06-01' }, 
        leaseEnd: '2026-05-01', notes: '' },
      { id: 'u3', unitId: 'WIU-03', size: 35, type: 'Large', status: 'vacant', price: 28000, 
        tenant: null, leaseEnd: '', notes: '' },
      { id: 'u4', unitId: 'WIU-04', size: 12, type: 'Small', status: 'maintenance', price: 10000, 
        tenant: null, leaseEnd: '', notes: 'Roof repair in progress' },
    ]
  },
  { 
    id: 'p2', icon: '🏢', color: 'c1', name: 'Kilimani Storage Centre', location: 'Kilimani, Nairobi', 
    units: [
      { id: 'u5', unitId: 'KSC-01', size: 8, type: 'Small', status: 'occupied', price: 9500, 
        tenant: { name: 'Peter Mwenda', initials: 'PM', phone: '+254 733 555 666', since: '2024-01-01' }, 
        leaseEnd: '2025-12-01', notes: '' },
      { id: 'u6', unitId: 'KSC-02', size: 15, type: 'Medium', status: 'occupied', price: 16000, 
        tenant: { name: 'Grace Njeri', initials: 'GN', phone: '+254 701 777 888', since: '2024-08-01' }, 
        leaseEnd: '2025-07-01', notes: '' },
      { id: 'u7', unitId: 'KSC-03', size: 8, type: 'Small', status: 'vacant', price: 9500, 
        tenant: null, leaseEnd: '', notes: '' },
    ]
  },
  { 
    id: 'p3', icon: '🏗️', color: 'c2', name: 'Mombasa Road Warehouse', location: 'Industrial Area, Nairobi', 
    units: [
      { id: 'u8', unitId: 'MRW-01', size: 80, type: 'Warehouse', status: 'occupied', price: 52000, 
        tenant: { name: 'Safiri Logistics', initials: 'SL', phone: '+254 20 123 4567', since: '2023-01-01' }, 
        leaseEnd: '2025-12-01', notes: '' },
      { id: 'u9', unitId: 'MRW-02', size: 80, type: 'Warehouse', status: 'occupied', price: 52000, 
        tenant: { name: 'BuildMart Ltd', initials: 'BL', phone: '+254 20 765 4321', since: '2023-03-01' }, 
        leaseEnd: '2026-02-01', notes: '' },
    ]
  },
];

const SEED_PAYMENTS = [
  { id: 'pay1', tenant: 'James Kariuki', unit: 'WIU-01', amount: 18000, date: '2026-02-01', status: 'paid', type: 'Rent', propId: 'p1' },
  { id: 'pay2', tenant: 'Amina Odhiambo', unit: 'WIU-02', amount: 18000, date: '2026-02-01', status: 'paid', type: 'Rent', propId: 'p1' },
  { id: 'pay3', tenant: 'Grace Njeri', unit: 'KSC-02', amount: 16000, date: '2026-02-01', status: 'pending', type: 'Rent', propId: 'p2' },
  { id: 'pay4', tenant: 'Peter Mwenda', unit: 'KSC-01', amount: 9500, date: '2026-01-01', status: 'paid', type: 'Rent', propId: 'p2' },
  { id: 'pay5', tenant: 'Safiri Logistics', unit: 'MRW-01', amount: 52000, date: '2026-02-01', status: 'paid', type: 'Rent', propId: 'p3' },
  { id: 'pay6', tenant: 'BuildMart Ltd', unit: 'MRW-02', amount: 52000, date: '2026-02-01', status: 'overdue', type: 'Rent', propId: 'p3' },
];

export default function LandlordLayout() {
  const [props, setProps] = useState(SEED_PROPS);
  const [payments, setPayments] = useState(SEED_PAYMENTS);
  const [page, setPage] = useState('overview');
  const [toasts, setToasts] = useState([]);

  // Profile
  const [profile, setProfile] = useState({ 
    name: 'Sarah Wambui', 
    email: 'sarah@vaultspace.co.ke', 
    phone: '+254 722 890 123', 
    county: 'Nairobi', 
    idNumber: '29384756' 
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

  useEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-portal', 'owner');
    el.textContent = document.querySelector('style[data-portal="owner"]')?.textContent || '';
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* Toast helper */
  const toast = (msg, type = 'success') => {
    const id = nid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
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
  
  const saveProp = d => {
    if (propMod.mode === 'add') { 
      setProps(ps => [...ps, { ...d, id: nid(), units: [] }]); 
      toast('Property added'); 
    } else { 
      setProps(ps => ps.map(p => p.id === d.id ? { ...p, ...d } : p)); 
      toast('Property updated'); 
    }
    setPropMod(m => ({ ...m, open: false }));
  };
  
  const deleteProp = p => setConfirm({ 
    open: true, 
    icon: '🗑️', 
    title: 'Delete Property?', 
    desc: `"${p.name}" and all its units will be permanently removed.`, 
    onOk: () => { 
      setProps(ps => ps.filter(x => x.id !== p.id)); 
      toast('Property deleted', 'error'); 
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

  const saveProfile = () => {
    setProfile({ ...editProfForm });
    setEditProf(false);
    toast('Profile saved');
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