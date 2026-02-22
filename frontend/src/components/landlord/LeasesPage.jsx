import React from 'react';
import { FaSearch, FaTrash } from 'react-icons/fa';
import { getInitials } from '../../utils/utils';

export default function LeasesPage({ 
  active, filtLeases, leaseSearch, setLeaseSearch, setPanel, removeTenant 
}) {
  if (!active) return null;

  const isActive = (leaseEnd) => {
    if (!leaseEnd) return false;
    return new Date(leaseEnd) > new Date();
  };

  return (
    <div className="op-page active">
      <div className="op-page-header">
        <div className="op-tag">Tenancy</div>
        <h1 className="op-page-title">Active <span>Leases</span></h1>
        <p className="op-page-desc">All current tenants across your units. Click to view or manage a lease.</p>
      </div>
      <div className="op-toolbar">
        <div className="op-search-wrap">
          <span className="op-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search tenant or unit…" 
            value={leaseSearch} 
            onChange={e => setLeaseSearch(e.target.value)} 
          />
        </div>
        <span style={{ fontSize: '.79rem', color: 'var(--muted)' }}>{filtLeases.length} active leases</span>
      </div>
      <div className="op-lease-list">
        {filtLeases.map(u => (
          <div 
            key={u.id} 
            className="op-lease-row" 
            onClick={() => setPanel({ open: true, unitId: u.id, propId: u.propId })}
          >
            <div className="op-lease-av">{u.tenant.initials}</div>
            <div className="op-lease-info">
              <div className="op-lease-name">{u.tenant.name}</div>
              <div className="op-lease-meta">{u.unitId} · {u.propName} · {u.size} m² {u.type}</div>
            </div>
            <div className="op-lease-dates">
              <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Since {u.tenant.since}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Ends {u.leaseEnd || '—'}</div>
            </div>
            <div style={{ marginLeft: 8 }}>
              <span className={`op-pill ${isActive(u.leaseEnd) ? 'op-pill-active' : 'op-pill-expired'}`}>
                {isActive(u.leaseEnd) ? 'Active' : 'Expired'}
              </span>
            </div>
            <div className="op-row-actions">
              <button 
                className="op-btn op-btn-danger op-btn-xs" 
                title="Remove Tenant" 
                onClick={e => { e.stopPropagation(); removeTenant(u, u.propId); }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        {filtLeases.length === 0 && (
          <div className="op-empty">No active leases found.</div>
        )}
      </div>
    </div>
  );
}