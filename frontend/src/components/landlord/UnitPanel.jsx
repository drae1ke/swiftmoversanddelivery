import React from 'react';
import { FaTimes, FaEdit, FaTrash, FaPhone } from 'react-icons/fa';
import { getPillClass } from '../../utils/utils';

export default function UnitPanel({ 
  panel, setPanel, getPanelUnit, getPanelProp, 
  openEditUnit, removeTenant, openAssignTenant, deleteUnit, toast 
}) {
  if (!panel.open) return null;

  const u = getPanelUnit();
  const p = getPanelProp();
  if (!u || !p) return null;

  return (
    <>
      <div className={`op-overlay ${panel.open ? 'open' : ''}`} onClick={() => setPanel(p => ({ ...p, open: false }))} />
      <div className={`op-panel ${panel.open ? 'open' : ''}`}>
        <div className="op-panel-head">
          <div className="op-panel-title">{u.unitId}</div>
          <button className="op-panel-close" onClick={() => setPanel(p => ({ ...p, open: false }))}>
            <FaTimes />
          </button>
        </div>
        <div className="op-panel-body">
          {/* Unit details */}
          <div>
            <span className="op-psec">Unit Details</span>
            {[
              ['Property', p.name],
              ['Size', `${u.size} m²`],
              ['Type', u.type],
              ['Price', `KES ${u.price.toLocaleString()}/mo`],
              ['Status', u.status],
              ...(u.leaseEnd ? [['Lease End', u.leaseEnd]] : []),
              ...(u.notes ? [['Notes', u.notes]] : [])
            ].map(([l, v]) => (
              <div key={l} className="op-ir">
                <span className="op-ir-l">{l}</span>
                <span className="op-ir-v">
                  {l === 'Status' ? <span className={`op-pill ${getPillClass(v)}`}>{v}</span> : v}
                </span>
              </div>
            ))}
          </div>

          {/* Tenant section */}
          {u.tenant ? (
            <div>
              <span className="op-psec">Current Tenant</span>
              <div className="op-tenant-chip">
                <div className="op-t-av">{u.tenant.initials}</div>
                <div style={{ flex: 1 }}>
                  <div className="op-t-name">{u.tenant.name}</div>
                  <div className="op-t-meta">
                    Since {u.tenant.since}{u.leaseEnd ? ` · Ends ${u.leaseEnd}` : ''}
                  </div>
                </div>
                <button className="op-btn op-btn-outline op-btn-xs" onClick={() => toast(`📞 ${u.tenant.phone}`)}>
                  <FaPhone /> Call
                </button>
              </div>
              <button 
                className="op-btn op-btn-danger op-btn-sm" 
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={() => removeTenant(u, p.id)}
              >
                Remove Tenant
              </button>
            </div>
          ) : (
            <div>
              <span className="op-psec">Tenant</span>
              <div style={{ 
                padding: '18px 14px', 
                background: 'var(--off)', 
                border: '1px solid var(--border-l)', 
                borderRadius: 'var(--r)', 
                textAlign: 'center', 
                marginBottom: 10 
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 7 }}>
                  {u.status === 'maintenance' ? '🔧' : '⬜'}
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--muted)', fontWeight: 300 }}>
                  {u.status === 'maintenance' ? 'Under maintenance' : 'No tenant assigned'}
                </div>
              </div>
              {u.status !== 'maintenance' && (
                <button 
                  className="op-btn op-btn-primary op-btn-sm" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => openAssignTenant(u, p.id)}
                >
                  Assign Tenant
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div>
            <span className="op-psec">Manage Unit</span>
            <div className="op-prow">
              <button className="op-btn op-btn-outline" onClick={() => openEditUnit(u, p.id)}>
                <FaEdit /> Edit Unit
              </button>
              <button 
                className="op-btn op-btn-danger" 
                onClick={() => {
                  setPanel(p => ({ ...p, open: false }));
                  setTimeout(() => deleteUnit(u, p.id), 220);
                }}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}