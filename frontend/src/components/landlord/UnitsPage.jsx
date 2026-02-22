import React from 'react';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { formatNumber, getPillClass } from '../../utils/utils';

export default function UnitsPage({ 
  active, filtUnits, unitSearch, setUnitSearch, 
  unitFilter, setUnitFilter, setPanel, openEditUnit, deleteUnit 
}) {
  if (!active) return null;

  const filters = ['all', 'occupied', 'vacant', 'maintenance'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'occupied': return '✅';
      case 'maintenance': return '🔧';
      default: return '⬜';
    }
  };

  return (
    <div className="op-page active">
      <div className="op-page-header">
        <div className="op-tag">Units</div>
        <h1 className="op-page-title">All Storage <span>Units</span></h1>
        <p className="op-page-desc">Click any unit to view details, manage tenants, edit or delete.</p>
      </div>
      <div className="op-toolbar">
        <div className="op-search-wrap">
          <span className="op-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search by ID, property, type…" 
            value={unitSearch} 
            onChange={e => setUnitSearch(e.target.value)} 
          />
        </div>
        <div className="op-filter-tabs">
          {filters.map(f => (
            <button 
              key={f} 
              className={`op-tab ${unitFilter === f ? 'active' : ''}`} 
              onClick={() => setUnitFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '.79rem', color: 'var(--muted)' }}>{filtUnits.length} units</span>
      </div>
      <div className="op-unit-list">
        {filtUnits.map(u => (
          <div 
            key={u.id} 
            className="op-unit-row" 
            onClick={() => setPanel({ open: true, unitId: u.id, propId: u.propId })}
          >
            <div className="op-unit-icon">{getStatusIcon(u.status)}</div>
            <div className="op-unit-info" style={{ flex: 2 }}>
              <div className="op-unit-name">{u.unitId}</div>
              <div className="op-unit-meta">{u.propName}</div>
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', minWidth: 90 }}>
              {u.size} m² · {u.type}
            </div>
            <span className={`op-pill ${getPillClass(u.status)}`}>{u.status}</span>
            <div className="op-unit-price" style={{ minWidth: 100, textAlign: 'right' }}>
              KES {formatNumber(u.price)}<br /><small>/mo</small>
            </div>
            <div className="op-row-actions">
              <button 
                className="op-btn op-btn-outline op-btn-xs" 
                title="Edit" 
                onClick={e => { e.stopPropagation(); openEditUnit(u, u.propId); }}
              >
                <FaEdit />
              </button>
              <button 
                className="op-btn op-btn-danger op-btn-xs" 
                title="Delete" 
                onClick={e => { e.stopPropagation(); deleteUnit(u, u.propId); }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        {filtUnits.length === 0 && (
          <div className="op-empty">No units match your search.</div>
        )}
      </div>
    </div>
  );
}