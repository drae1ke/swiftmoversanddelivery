import { useState } from "react";



/* ─── seed ─── */
let _id = 0;
const nid = () => `${++_id}`;

const SEED = [
  { id:"p1", icon:"🏭", color:"c0", name:"Westlands Industrial Units", location:"Westlands, Nairobi", units:[
    { id:"u1", unitId:"WIU-01", size:20, type:"Standard", status:"occupied", price:18000, tenant:{ name:"James Kariuki", initials:"JK", phone:"+254 712 111 222", since:"Mar 2024"}, leaseEnd:"2026-02-01", notes:"" },
    { id:"u2", unitId:"WIU-02", size:20, type:"Standard", status:"occupied", price:18000, tenant:{ name:"Amina Odhiambo", initials:"AO", phone:"+254 722 333 444", since:"Jun 2024"}, leaseEnd:"2026-05-01", notes:"" },
    { id:"u3", unitId:"WIU-03", size:35, type:"Large",    status:"vacant",   price:28000, tenant:null, leaseEnd:"", notes:"" },
    { id:"u4", unitId:"WIU-04", size:12, type:"Small",    status:"maintenance", price:10000, tenant:null, leaseEnd:"", notes:"Roof repair in progress" },
  ]},
  { id:"p2", icon:"🏢", color:"c1", name:"Kilimani Storage Centre", location:"Kilimani, Nairobi", units:[
    { id:"u5", unitId:"KSC-01", size:8,  type:"Small",    status:"occupied", price:9500,  tenant:{ name:"Peter Mwenda", initials:"PM", phone:"+254 733 555 666", since:"Jan 2024"}, leaseEnd:"2025-12-01", notes:"" },
    { id:"u6", unitId:"KSC-02", size:15, type:"Medium",   status:"occupied", price:16000, tenant:{ name:"Grace Njeri",  initials:"GN", phone:"+254 701 777 888", since:"Aug 2024"}, leaseEnd:"2025-07-01", notes:"" },
    { id:"u7", unitId:"KSC-03", size:8,  type:"Small",    status:"vacant",   price:9500,  tenant:null, leaseEnd:"", notes:"" },
  ]},
  { id:"p3", icon:"🏗️", color:"c2", name:"Mombasa Road Warehouse", location:"Industrial Area, Nairobi", units:[
    { id:"u8", unitId:"MRW-01", size:80, type:"Warehouse", status:"occupied", price:52000, tenant:{ name:"Safiri Logistics", initials:"SL", phone:"+254 20 123 4567", since:"Jan 2023"}, leaseEnd:"2025-12-01", notes:"" },
    { id:"u9", unitId:"MRW-02", size:80, type:"Warehouse", status:"occupied", price:52000, tenant:{ name:"BuildMart Ltd",    initials:"BL", phone:"+254 20 765 4321", since:"Mar 2023"}, leaseEnd:"2026-02-01", notes:"" },
  ]},
];

const ICONS   = ["🏭","🏢","🏗️","📦","🏠","🏪","🏬","🏰"];
const COLORS  = ["c0","c1","c2","c3","c4"];
const UTYPES  = ["Mini","Small","Medium","Standard","Large","Warehouse"];
const STATUSES= ["vacant","occupied","maintenance"];
const COUNTIES= ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Kiambu","Machakos"];

const mkInitials = n => n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
const pillCls = s => s==="occupied"?"pill-occupied":s==="maintenance"?"pill-maintenance":"pill-vacant";
const occBadge = units => {
  const p = units.length ? Math.round(units.filter(u=>u.status==="occupied").length/units.length*100) : 0;
  return p===100?["pb-active","Active"]:p>0?["pb-partial","Partial"]:["pb-vacant","Vacant"];
};

/* ─── App ─── */
export default function App() {
  const [props, setProps] = useState(SEED);
  const [page, setPage] = useState("overview");
  const [toasts, setToasts] = useState([]);
  const [profile, setProfile] = useState({ name:"Sarah Wambui", email:"sarah@vaultspace.co.ke", phone:"+254 722 890 123", county:"Nairobi", idNumber:"29384756" });
  const [editProf, setEditProf] = useState(false);
  const [editProfForm, setEditProfForm] = useState({...profile});

  /* panel */
  const [panel, setPanel] = useState({ open:false, unitId:null, propId:null });

  /* modals */
  const [propMod, setPropMod]   = useState({ open:false, mode:"add", data:{} });
  const [unitMod, setUnitMod]   = useState({ open:false, mode:"add", propId:null, data:{} });
  const [tenantMod, setTenantMod] = useState({ open:false, unitId:null, propId:null });
  const [confirm, setConfirm]   = useState({ open:false, title:"", desc:"", icon:"", danger:false, onOk:()=>{} });
  const [logoutMod, setLogoutMod] = useState(false);

  /* search */
  const [pSearch, setPSearch] = useState("");
  const [uSearch, setUSearch] = useState("");

  /* toast */
  const toast = (msg, type="success") => {
    const id = nid();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  };

  /* derived */
  const allUnits = props.flatMap(p=>p.units.map(u=>({...u,propName:p.name,propId:p.id})));
  const totalU = allUnits.length;
  const totalOcc = allUnits.filter(u=>u.status==="occupied").length;
  const totalVac = allUnits.filter(u=>u.status==="vacant").length;
  const totalRev = allUnits.filter(u=>u.status==="occupied").reduce((a,u)=>a+u.price,0);

  const filtU = allUnits.filter(u=>
    u.unitId.toLowerCase().includes(uSearch.toLowerCase())||
    u.propName.toLowerCase().includes(uSearch.toLowerCase())||
    u.type.toLowerCase().includes(uSearch.toLowerCase())||
    u.status.toLowerCase().includes(uSearch.toLowerCase())
  );
  const filtP = props.filter(p=>
    p.name.toLowerCase().includes(pSearch.toLowerCase())||
    p.location.toLowerCase().includes(pSearch.toLowerCase())
  );

  const today = new Date().toLocaleDateString("en-KE",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  const pageLabels={overview:"Overview",properties:"Properties",units:"All Units",profile:"My Profile"};

  /* panel helpers */
  const getPanelUnit = () => {
    if (!panel.propId || !panel.unitId) return null;
    const p = props.find(x=>x.id===panel.propId);
    return p ? p.units.find(u=>u.id===panel.unitId) : null;
  };
  const getPanelProp = () => props.find(x=>x.id===panel.propId);

  /* ─── Property CRUD ─── */
  const openAddProp = () => setPropMod({ open:true, mode:"add", data:{ name:"", location:"", icon:"🏢", color:"c0" } });
  const openEditProp = (p,e) => { e?.stopPropagation(); setPropMod({ open:true, mode:"edit", data:{...p} }); };
  const saveProp = d => {
    if (propMod.mode==="add") { setProps(ps=>[...ps,{...d,id:nid(),units:[]}]); toast("Property added"); }
    else { setProps(ps=>ps.map(p=>p.id===d.id?{...p,...d}:p)); toast("Property updated"); }
    setPropMod(m=>({...m,open:false}));
  };
  const deleteProp = p => setConfirm({ open:true, icon:"🗑️", title:"Delete Property?", desc:`"${p.name}" and all its units will be permanently removed.`, danger:true, onOk:()=>{ setProps(ps=>ps.filter(x=>x.id!==p.id)); toast("Property deleted","error"); setConfirm(c=>({...c,open:false})); } });

  /* ─── Unit CRUD ─── */
  const openAddUnit = (propId,e) => { e?.stopPropagation(); setUnitMod({ open:true, mode:"add", propId, data:{ unitId:"", size:"", type:"Small", status:"vacant", price:"", leaseEnd:"", notes:"" } }); };
  const openEditUnit = (u,propId) => { setPanel(p=>({...p,open:false})); setTimeout(()=>setUnitMod({ open:true, mode:"edit", propId, data:{...u} }),220); };
  const saveUnit = d => {
    if (unitMod.mode==="add") {
      setProps(ps=>ps.map(p=>p.id===unitMod.propId?{...p,units:[...p.units,{...d,id:nid(),tenant:null,price:Number(d.price),size:Number(d.size)||d.size}]}:p));
      toast("Unit added");
    } else {
      setProps(ps=>ps.map(p=>p.id===unitMod.propId?{...p,units:p.units.map(u=>u.id===d.id?{...u,...d,price:Number(d.price),size:Number(d.size)||d.size}:u)}:p));
      toast("Unit updated");
    }
    setUnitMod(m=>({...m,open:false}));
  };
  const deleteUnit = (u,propId) => setConfirm({ open:true, icon:"🗑️", title:"Delete Unit?", desc:`Unit "${u.unitId}" will be permanently removed.`, danger:true, onOk:()=>{ setProps(ps=>ps.map(p=>p.id===propId?{...p,units:p.units.filter(x=>x.id!==u.id)}:p)); toast("Unit deleted","error"); setConfirm(c=>({...c,open:false})); setPanel(p=>({...p,open:false})); } });

  /* ─── Tenant CRUD ─── */
  const openAssignTenant = (u,propId) => { setPanel(p=>({...p,open:false})); setTimeout(()=>setTenantMod({ open:true, unitId:u.id, propId }),220); };
  const saveTenant = (form,unitId,propId) => {
    const tenant = { name:form.name, initials:mkInitials(form.name), phone:form.phone, since:form.since };
    setProps(ps=>ps.map(p=>p.id===propId?{...p,units:p.units.map(u=>u.id===unitId?{...u,tenant,status:"occupied",leaseEnd:form.leaseEnd}:u)}:p));
    toast("Tenant assigned");
    setTenantMod(m=>({...m,open:false}));
  };
  const removeTenant = (u,propId) => setConfirm({ open:true, icon:"👤", title:"Remove Tenant?", desc:`${u.tenant?.name} will be removed and the unit set to vacant.`, danger:true, onOk:()=>{ setProps(ps=>ps.map(p=>p.id===propId?{...p,units:p.units.map(x=>x.id===u.id?{...x,tenant:null,status:"vacant",leaseEnd:""}:x)}:p)); toast("Tenant removed","error"); setConfirm(c=>({...c,open:false})); } });

  const nav = [
    { section:"Portfolio" },
    { id:"overview", icon:"▦", label:"Overview" },
    { id:"properties", icon:"🏢", label:"Properties", badge:props.length },
    { id:"units", icon:"📦", label:"All Units", badge:`${totalVac} vacant`, bc:totalVac>0?"":"g" },
    { section:"Account" },
    { id:"profile", icon:"👤", label:"My Profile" },
  ];

  return (
    <>
      <div className="shell">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">Vault<span>Space</span></div>
            <div className="logo-sub">Owner Portal</div>
          </div>
          <nav className="sidebar-nav">
            {nav.map((item,i)=> item.section
              ? <div key={i} className="nav-section">{item.section}</div>
              : <button key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
                  <span className="nav-icon">{item.icon}</span>{item.label}
                  {item.badge!==undefined&&<span className={`nav-badge ${item.bc||""}`}>{item.badge}</span>}
                </button>
            )}
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip" onClick={()=>setPage("profile")}>
              <div className="u-av">SW</div>
              <div><div className="u-name">{profile.name}</div><div className="u-role">Property Owner</div></div>
            </div>
            <button className="logout-btn" onClick={()=>setLogoutMod(true)}>⎋ Log Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="topbar">
            <span className="topbar-title">{pageLabels[page]}</span>
            <span className="topbar-sub">{today}</span>
            <button className="notif-btn">🔔<span className="notif-dot"/></button>
          </header>

          {/* ═══ OVERVIEW ═══ */}
          <div className={`page ${page==="overview"?"active":""}`}>
            <div className="page-header">
              <div className="page-tag">Welcome back, Sarah</div>
              <h1 className="page-title">Your Storage <span>Portfolio</span></h1>
              <p className="page-desc">Live snapshot of all properties, occupancy, and revenue.</p>
            </div>
            <div className="stats-row">
              <div className="stat-card"><div className="stat-lbl">Properties</div><div className="stat-val">{props.length}</div><div className="stat-sub">{totalU} total units</div></div>
              <div className="stat-card"><div className="stat-lbl">Occupied</div><div className="stat-val">{totalOcc}</div><div className="stat-sub">{totalU?Math.round(totalOcc/totalU*100):0}% occupancy</div></div>
              <div className="stat-card"><div className="stat-lbl">Vacant</div><div className="stat-val red">{totalVac}</div><div className="stat-sub">available to book</div></div>
              <div className="stat-card"><div className="stat-lbl">Monthly Revenue</div><div className="stat-val" style={{fontSize:"1.4rem"}}>KES {(totalRev/1000).toFixed(0)}K</div><div className="stat-sub">from occupied units</div></div>
            </div>
            <div className="ov-grid">
              <div className="card" style={{padding:"20px 18px"}}>
                <div className="sec-header">
                  <div className="sec-title">Units at a Glance</div>
                  <button className="btn btn-outline btn-sm" onClick={()=>setPage("units")}>View All →</button>
                </div>
                <div className="unit-list">
                  {allUnits.slice(0,6).map(u=>(
                    <div key={u.id} className="unit-row" onClick={()=>setPanel({open:true,unitId:u.id,propId:u.propId})}>
                      <div className="unit-icon">{u.status==="occupied"?"✅":u.status==="maintenance"?"🔧":"⬜"}</div>
                      <div className="unit-info"><div className="unit-name">{u.unitId}</div><div className="unit-meta">{u.propName} · {u.size} m² · {u.type}</div></div>
                      <span className={`pill ${pillCls(u.status)}`}>{u.status}</span>
                      <div className="unit-price">KES {u.price.toLocaleString()}<br/><small>/mo</small></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{padding:"20px 18px"}}>
                <div className="sec-header"><div className="sec-title">Activity</div></div>
                <div className="activity-feed">
                  {[
                    {c:"g",t:<><strong>KSC-02</strong> — rent received · Grace Njeri</>,d:"2 hrs ago"},
                    {c:"r",t:<><strong>TRM-01</strong> — new inquiry via portal</>,d:"5 hrs ago"},
                    {c:"a",t:<><strong>WIU-04</strong> — maintenance flagged</>,d:"Yesterday"},
                    {c:"g",t:<><strong>MRW-01</strong> — lease renewed · 12 months</>,d:"2 days ago"},
                    {c:"r",t:<><strong>KSC-03</strong> — unit went vacant</>,d:"5 days ago"},
                  ].map((a,i)=>(
                    <div key={i} className="act-item">
                      <div className={`act-dot ${a.c}`}/>
                      <div><div className="act-text">{a.t}</div><div className="act-time">{a.d}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ PROPERTIES ═══ */}
          <div className={`page ${page==="properties"?"active":""}`}>
            <div className="page-header">
              <div className="page-tag">Portfolio</div>
              <h1 className="page-title">Your <span>Properties</span></h1>
              <p className="page-desc">Add, edit, or remove properties and manage their storage units.</p>
            </div>
            <div className="toolbar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input placeholder="Search properties…" value={pSearch} onChange={e=>setPSearch(e.target.value)}/>
              </div>
              <button className="btn btn-primary" onClick={openAddProp}>＋ Add Property</button>
            </div>
            <div className="props-grid">
              {filtP.map(prop=>{
                const occ=prop.units.filter(u=>u.status==="occupied").length;
                const vac=prop.units.filter(u=>u.status==="vacant").length;
                const pct=prop.units.length?Math.round(occ/prop.units.length*100):0;
                const [bc,bl]=occBadge(prop.units);
                const rev=prop.units.filter(u=>u.status==="occupied").reduce((a,u)=>a+u.price,0);
                return (
                  <div key={prop.id} className="prop-card">
                    <div className={`prop-img ${prop.color}`}>
                      {prop.icon}
                      <span className={`pb ${bc}`}>{bl}</span>
                      <div className="cap-wrap"><div className="cap-bg"><div className="cap-fill" style={{width:`${pct}%`}}/></div><div className="cap-lbl">{pct}% occupied</div></div>
                    </div>
                    <div className="prop-body">
                      <div className="prop-name">{prop.name}</div>
                      <div className="prop-loc">📍 {prop.location}</div>
                      <div className="prop-stats-g">
                        <div className="psc"><div className="psc-v">{prop.units.length}</div><div className="psc-l">Units</div></div>
                        <div className="psc"><div className="psc-v">{occ}</div><div className="psc-l">Occupied</div></div>
                        <div className="psc"><div className={`psc-v ${vac>0?"r":""}`}>{vac}</div><div className="psc-l">Vacant</div></div>
                      </div>
                      <div className="prop-footer">
                        <div className="prop-rev">KES {rev.toLocaleString()} <small>/month</small></div>
                        <div className="prop-actions">
                          <button className="btn btn-outline btn-sm" onClick={()=>{setUSearch(prop.name.split(" ")[0]);setPage("units")}}>Units</button>
                          <button className="btn btn-outline btn-sm" title="Edit" onClick={e=>openEditProp(prop,e)}>✏️</button>
                          <button className="btn btn-outline btn-sm" title="Delete" onClick={e=>{e.stopPropagation();deleteProp(prop)}}>🗑️</button>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" style={{width:"100%",justifyContent:"center",marginTop:10}} onClick={e=>openAddUnit(prop.id,e)}>＋ Add Unit</button>
                    </div>
                  </div>
                );
              })}
              {filtP.length===0&&(
                <div style={{gridColumn:"1/-1",padding:"48px",textAlign:"center",color:"var(--muted)",fontSize:".87rem"}}>
                  No properties found. <button className="btn btn-primary btn-sm" style={{marginLeft:10}} onClick={openAddProp}>Add one →</button>
                </div>
              )}
            </div>
          </div>

          {/* ═══ ALL UNITS ═══ */}
          <div className={`page ${page==="units"?"active":""}`}>
            <div className="page-header">
              <div className="page-tag">Units</div>
              <h1 className="page-title">All Storage <span>Units</span></h1>
              <p className="page-desc">Click any unit to view details, manage tenants, edit or delete.</p>
            </div>
            <div className="toolbar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input placeholder="Search by ID, property, type, status…" value={uSearch} onChange={e=>setUSearch(e.target.value)}/>
              </div>
              <span style={{fontSize:".79rem",color:"var(--muted)"}}>{filtU.length} units</span>
            </div>
            <div className="unit-list">
              {filtU.map(u=>(
                <div key={u.id} className="unit-row" onClick={()=>setPanel({open:true,unitId:u.id,propId:u.propId})}>
                  <div className="unit-icon">{u.status==="occupied"?"✅":u.status==="maintenance"?"🔧":"⬜"}</div>
                  <div className="unit-info" style={{flex:2}}><div className="unit-name">{u.unitId}</div><div className="unit-meta">{u.propName}</div></div>
                  <div style={{fontSize:".78rem",color:"var(--muted)",minWidth:90}}>{u.size} m² · {u.type}</div>
                  <span className={`pill ${pillCls(u.status)}`}>{u.status}</span>
                  <div className="unit-price" style={{minWidth:100,textAlign:"right"}}>KES {u.price.toLocaleString()}<br/><small>/mo</small></div>
                  <div style={{display:"flex",gap:5,marginLeft:4}}>
                    <button className="btn btn-outline btn-xs" title="Edit" onClick={e=>{e.stopPropagation();openEditUnit(u,u.propId)}}>✏️</button>
                    <button className="btn btn-outline btn-xs" title="Delete" onClick={e=>{e.stopPropagation();deleteUnit(u,u.propId)}}>🗑️</button>
                  </div>
                </div>
              ))}
              {filtU.length===0&&<div style={{padding:"48px",textAlign:"center",color:"var(--muted)",fontSize:".87rem"}}>No units match your search.</div>}
            </div>
          </div>

          {/* ═══ PROFILE ═══ */}
          <div className={`page ${page==="profile"?"active":""}`}>
            <div className="page-header">
              <div className="page-tag">My Account</div>
              <h1 className="page-title">Owner <span>Profile</span></h1>
              <p className="page-desc">Manage your personal details and account preferences.</p>
            </div>
            <div className="profile-layout">
              <div className="profile-card">
                <div className="p-av">SW</div>
                <div className="p-name">{profile.name}</div>
                <div className="p-email">{profile.email}</div>
                <div className="p-stats">
                  <div className="ps"><div className="ps-v">{props.length}</div><div className="ps-l">Properties</div></div>
                  <div className="ps"><div className="ps-v">{totalU}</div><div className="ps-l">Units</div></div>
                  <div className="ps"><div className="ps-v">{totalOcc}</div><div className="ps-l">Occupied</div></div>
                  <div className="ps"><div className="ps-v" style={{fontSize:".9rem"}}>{(totalRev/1000).toFixed(0)}K</div><div className="ps-l">Rev/mo</div></div>
                </div>
                <button className="btn btn-outline" style={{width:"100%",justifyContent:"center",fontSize:".82rem"}} onClick={()=>{setEditProf(!editProf);setEditProfForm({...profile})}}>
                  ✏️ {editProf?"Cancel":"Edit Profile"}
                </button>
              </div>
              <div className="profile-content">
                <div className="info-card">
                  <div className="ic-hdr"><div className="ic-title">Personal Information</div>{!editProf&&<button className="ic-edit" onClick={()=>setEditProf(true)}>Edit</button>}</div>
                  {!editProf ? (
                    <div className="info-grid">
                      {[["Full Name",profile.name],["Phone",profile.phone],["Email",profile.email],["County",profile.county],["ID Number",profile.idNumber],["Member Since","January 2023"]].map(([l,v])=>(
                        <div key={l}><div className="if-l">{l}</div><div className="if-v">{v}</div></div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="fg">
                        <div className="frow">
                          <div className="field"><label>Full Name</label><input value={editProfForm.name} onChange={e=>setEditProfForm({...editProfForm,name:e.target.value})}/></div>
                          <div className="field"><label>Phone</label><input value={editProfForm.phone} onChange={e=>setEditProfForm({...editProfForm,phone:e.target.value})}/></div>
                        </div>
                        <div className="frow">
                          <div className="field"><label>Email</label><input value={editProfForm.email} onChange={e=>setEditProfForm({...editProfForm,email:e.target.value})}/></div>
                          <div className="field"><label>County</label><select value={editProfForm.county} onChange={e=>setEditProfForm({...editProfForm,county:e.target.value})}>{COUNTIES.map(c=><option key={c}>{c}</option>)}</select></div>
                        </div>
                      </div>
                      <div className="form-footer">
                        <button className="btn btn-outline" onClick={()=>setEditProf(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={()=>{setProfile({...editProfForm});setEditProf(false);toast("Profile saved")}}>Save Changes</button>
                      </div>
                    </>
                  )}
                </div>
                <div className="info-card">
                  <div className="ic-hdr"><div className="ic-title">Portfolio Summary</div></div>
                  <div className="info-grid">
                    {[["Properties",props.length],["Total Units",totalU],["Occupied",totalOcc],["Vacant",totalVac],["Occupancy",`${totalU?Math.round(totalOcc/totalU*100):0}%`],["Monthly Revenue",`KES ${totalRev.toLocaleString()}`]].map(([l,v])=>(
                      <div key={l}><div className="if-l">{l}</div><div className="if-v">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="dz">
                  <div className="dz-title">Danger Zone</div>
                  <div className="dz-row">
                    <div className="dz-desc">Permanently delete your account and all property data. This cannot be undone.</div>
                    <button className="btn btn-danger btn-sm" onClick={()=>toast("Account deletion requires contacting support.","error")}>Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ UNIT SLIDE PANEL ═══ */}
        <div className={`overlay ${panel.open?"open":""}`} onClick={()=>setPanel(p=>({...p,open:false}))}/>
        <div className={`panel ${panel.open?"open":""}`}>
          {(()=>{
            const u = getPanelUnit();
            const p = getPanelProp();
            if (!u||!p) return null;
            return (
              <>
                <div className="panel-head">
                  <div className="panel-title">{u.unitId}</div>
                  <button className="panel-close" onClick={()=>setPanel(x=>({...x,open:false}))}>✕</button>
                </div>
                <div className="panel-body">
                  <div>
                    <div className="panel-sec">Unit Details</div>
                    {[["Property",p.name],["Size",`${u.size} m²`],["Type",u.type],["Price",`KES ${Number(u.price).toLocaleString()}/mo`],["Status",u.status], ( u.leaseEnd?[["Lease End",u.leaseEnd]]:[] ), ( u.notes?[["Notes",u.notes]]:[] )].map(([l,v])=>(
                      <div key={l} className="ir"><span className="ir-l">{l}</span>
                        <span className="ir-v">{l==="Status"?<span className={`pill ${pillCls(v)}`}>{v}</span>:v}</span>
                      </div>
                    ))}
                  </div>

                  {u.tenant ? (
                    <div>
                      <div className="panel-sec">Current Tenant</div>
                      <div className="tenant-chip">
                        <div className="t-av">{u.tenant.initials}</div>
                        <div><div className="t-name">{u.tenant.name}</div><div className="t-since">Since {u.tenant.since}{u.leaseEnd?` · Ends ${u.leaseEnd}`:""}</div></div>
                        <div style={{marginLeft:"auto"}}><button className="btn btn-outline btn-xs" onClick={()=>alert(`📞 ${u.tenant.phone}`)}>Call</button></div>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{width:"100%",justifyContent:"center",marginTop:10}} onClick={()=>removeTenant(u,p.id)}>Remove Tenant</button>
                    </div>
                  ) : (
                    <div>
                      <div className="panel-sec">Tenant</div>
                      <div style={{padding:"18px 14px",background:"var(--off)",border:"1px solid var(--border-l)",borderRadius:"var(--r)",textAlign:"center",marginBottom:10}}>
                        <div style={{fontSize:"1.5rem",marginBottom:7}}>⬜</div>
                        <div style={{fontSize:".82rem",color:"var(--muted)",fontWeight:300}}>{u.status==="maintenance"?"Under maintenance — no tenant":"No tenant assigned"}</div>
                      </div>
                      {u.status!=="maintenance"&&<button className="btn btn-primary btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>openAssignTenant(u,p.id)}>Assign Tenant</button>}
                    </div>
                  )}

                  <div>
                    <div className="panel-sec">Manage Unit</div>
                    <div className="prow">
                      <button className="btn btn-outline" onClick={()=>openEditUnit(u,p.id)}>✏️ Edit Unit</button>
                      <button className="btn btn-danger" onClick={()=>{setPanel(x=>({...x,open:false}));setTimeout(()=>deleteUnit(u,p.id),220)}}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* ═══ PROPERTY MODAL ═══ */}
        <FormModal open={propMod.open} title={propMod.mode==="add"?"Add Property":"Edit Property"} onClose={()=>setPropMod(m=>({...m,open:false}))}>
          <PropForm key={propMod.open} init={propMod.data} onSave={saveProp} onCancel={()=>setPropMod(m=>({...m,open:false}))} isAdd={propMod.mode==="add"}/>
        </FormModal>

        {/* ═══ UNIT MODAL ═══ */}
        <FormModal open={unitMod.open} title={unitMod.mode==="add"?"Add Storage Unit":`Edit Unit — ${unitMod.data?.unitId}`} onClose={()=>setUnitMod(m=>({...m,open:false}))}>
          <UnitForm key={unitMod.open+unitMod.data?.id} init={unitMod.data} onSave={saveUnit} onCancel={()=>setUnitMod(m=>({...m,open:false}))} isAdd={unitMod.mode==="add"}/>
        </FormModal>

        {/* ═══ TENANT MODAL ═══ */}
        <FormModal open={tenantMod.open} title={`Assign Tenant`} onClose={()=>setTenantMod(m=>({...m,open:false}))}>
          <TenantForm key={tenantMod.open} onSave={(form)=>saveTenant(form,tenantMod.unitId,tenantMod.propId)} onCancel={()=>setTenantMod(m=>({...m,open:false}))}/>
        </FormModal>

        {/* ═══ CONFIRM MODAL ═══ */}
        <div className={`mo ${confirm.open?"open":""}`} onClick={e=>e.target===e.currentTarget&&setConfirm(c=>({...c,open:false}))}>
          <div className="modal modal-sm">
            <div className="modal-icon">{confirm.icon}</div>
            <div className="modal-title">{confirm.title}</div>
            <div className="modal-desc">{confirm.desc}</div>
            <div className="modal-acts">
              <button className="btn btn-outline" onClick={()=>setConfirm(c=>({...c,open:false}))}>Cancel</button>
              <button className={`btn ${confirm.danger?"btn-danger":"btn-primary"}`} onClick={confirm.onOk}>{confirm.danger?"Delete":"Confirm"}</button>
            </div>
          </div>
        </div>

        {/* ═══ LOGOUT MODAL ═══ */}
        <div className={`mo ${logoutMod?"open":""}`} onClick={e=>e.target===e.currentTarget&&setLogoutMod(false)}>
          <div className="modal modal-sm">
            <div className="modal-icon">⎋</div>
            <div className="modal-title">Log Out?</div>
            <div className="modal-desc">You'll need to sign in again to access your portal. Your data is always saved.</div>
            <div className="modal-acts">
              <button className="btn btn-outline" onClick={()=>setLogoutMod(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>{setLogoutMod(false);toast("Logged out")}}>Log Out</button>
            </div>
          </div>
        </div>

        {/* TOASTS */}
        <div className="toast-wrap">
          {toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.type==="success"?"✓":"✕"} {t.msg}</div>)}
        </div>
      </div>
    </>
  );
}

/* ─── Modal shell ─── */
function FormModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="mo open" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-xl">
        <div className="modal-hdr">
          <div className="modal-htitle">{title}</div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Property Form ─── */
function PropForm({ init, onSave, onCancel, isAdd }) {
  const [f, setF] = useState({ name:"", location:"", icon:"🏢", color:"c0", ...init });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <>
      <div className="fg">
        <div className="field"><label>Property Name</label><input placeholder="e.g. Westlands Industrial Units" value={f.name} onChange={e=>set("name",e.target.value)}/></div>
        <div className="field"><label>Location / Address</label><input placeholder="e.g. Westlands, Nairobi" value={f.location} onChange={e=>set("location",e.target.value)}/></div>
        <div className="frow">
          <div className="field"><label>Icon</label><select value={f.icon} onChange={e=>set("icon",e.target.value)}>{["🏭","🏢","🏗️","📦","🏠","🏪","🏬","🏰"].map(ic=><option key={ic} value={ic}>{ic}</option>)}</select></div>
          <div className="field"><label>Card Colour</label><select value={f.color} onChange={e=>set("color",e.target.value)}>{["c0","c1","c2","c3","c4"].map((c,i)=><option key={c} value={c}>Colour {i+1}</option>)}</select></div>
        </div>
      </div>
      <div className="form-footer">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>{ if(!f.name.trim()||!f.location.trim()) return alert("Name and location are required"); onSave(f); }}>{isAdd?"Add Property":"Save Changes"}</button>
      </div>
    </>
  );
}

/* ─── Unit Form ─── */
function UnitForm({ init, onSave, onCancel, isAdd }) {
  const [f, setF] = useState({ unitId:"", size:"", type:"Small", status:"vacant", price:"", leaseEnd:"", notes:"", ...init });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <>
      <div className="fg">
        <div className="frow">
          <div className="field"><label>Unit ID</label><input placeholder="e.g. WIU-05" value={f.unitId} onChange={e=>set("unitId",e.target.value)}/></div>
          <div className="field"><label>Size (m²)</label><input type="number" placeholder="e.g. 20" value={f.size} onChange={e=>set("size",e.target.value)}/></div>
        </div>
        <div className="frow">
          <div className="field"><label>Type</label><select value={f.type} onChange={e=>set("type",e.target.value)}>{["Mini","Small","Medium","Standard","Large","Warehouse"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="field"><label>Status</label><select value={f.status} onChange={e=>set("status",e.target.value)}>{["vacant","occupied","maintenance"].map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="frow">
          <div className="field"><label>Monthly Price (KES)</label><input type="number" placeholder="e.g. 15000" value={f.price} onChange={e=>set("price",e.target.value)}/></div>
          <div className="field"><label>Lease End Date</label><input type="date" value={f.leaseEnd} onChange={e=>set("leaseEnd",e.target.value)}/></div>
        </div>
        <div className="field"><label>Notes</label><textarea placeholder="Maintenance notes, access restrictions…" value={f.notes} onChange={e=>set("notes",e.target.value)}/></div>
      </div>
      <div className="form-footer">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>{ if(!f.unitId.trim()||!f.price) return alert("Unit ID and price are required"); onSave(f); }}>{isAdd?"Add Unit":"Save Changes"}</button>
      </div>
    </>
  );
}

/* ─── Tenant Form ─── */
function TenantForm({ onSave, onCancel }) {
  const [f, setF] = useState({ name:"", phone:"", since:"", leaseEnd:"" });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <>
      <div className="fg">
        <div className="field"><label>Full Name</label><input placeholder="e.g. James Kariuki" value={f.name} onChange={e=>set("name",e.target.value)}/></div>
        <div className="field"><label>Phone Number</label><input placeholder="+254 7XX XXX XXX" value={f.phone} onChange={e=>set("phone",e.target.value)}/></div>
        <div className="frow">
          <div className="field"><label>Move-in Date</label><input type="date" value={f.since} onChange={e=>set("since",e.target.value)}/></div>
          <div className="field"><label>Lease End Date</label><input type="date" value={f.leaseEnd} onChange={e=>set("leaseEnd",e.target.value)}/></div>
        </div>
      </div>
      <div className="form-footer">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>{ if(!f.name.trim()||!f.phone.trim()) return alert("Name and phone are required"); onSave(f); }}>Assign Tenant</button>
      </div>
    </>
  );
}