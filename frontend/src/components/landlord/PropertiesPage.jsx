import React from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { formatNumber, getOccupancyBadge } from '../../utils/utils';

export default function PropertiesPage({ 
  active, filtProps, propSearch, setPropSearch, 
  openAddProp, openEditProp, deleteProp, openAddUnit, setPage, setUnitSearch 
}) {
  if (!active) return null;

  return (
    <div className="op-page active">
      <div className="op-page-header">
        <div className="op-tag">Portfolio</div>
        <h1 className="op-page-title">Your <span>Properties</span></h1>
        <p className="op-page-desc">Add, edit, or remove properties and manage their storage units.</p>
      </div>
      <div className="op-toolbar">
        <div className="op-search-wrap">
          <span className="op-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search properties…" 
            value={propSearch} 
            onChange={e => setPropSearch(e.target.value)} 
          />
        </div>
        <button className="op-btn op-btn-primary" onClick={openAddProp}>
          <FaPlus /> Add Property
        </button>
      </div>
      <div className="op-props-grid">
        {filtProps.map(prop => {
          const occ = prop.units.filter(u => u.status === 'occupied').length;
          const vac = prop.units.filter(u => u.status === 'vacant').length;
          const pct = prop.units.length ? Math.round(occ / prop.units.length * 100) : 0;
          const [badgeClass, badgeLabel] = getOccupancyBadge(prop.units);
          const rev = prop.units.filter(u => u.status === 'occupied').reduce((a, u) => a + u.price, 0);

          return (
            <div key={prop.id} className="op-prop-card">
              <div className={`op-prop-img ${prop.color}`}>
                {prop.icon}
                <span className={`op-pbadge ${badgeClass}`}>{badgeLabel}</span>
                <div className="op-cap-wrap">
                  <div className="op-cap-bg">
                    <div className="op-cap-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="op-cap-lbl">{pct}% occupied</div>
                </div>
              </div>
              <div className="op-prop-body">
                <div className="op-prop-name">{prop.name}</div>
                <div className="op-prop-loc">📍 {prop.location}</div>
                <div className="op-prop-stats">
                  <div className="op-psc">
                    <div className="op-psc-v">{prop.units.length}</div>
                    <div className="op-psc-l">Units</div>
                  </div>
                  <div className="op-psc">
                    <div className="op-psc-v">{occ}</div>
                    <div className="op-psc-l">Occupied</div>
                  </div>
                  <div className="op-psc">
                    <div className={`op-psc-v ${vac > 0 ? 'r' : ''}`}>{vac}</div>
                    <div className="op-psc-l">Vacant</div>
                  </div>
                </div>
                <div className="op-prop-foot">
                  <div className="op-prop-rev">
                    KES {formatNumber(rev)} <small>/month</small>
                  </div>
                  <div className="op-prop-actions">
                    <button 
                      className="op-btn op-btn-outline op-btn-sm" 
                      onClick={() => {
                        setUnitSearch(prop.name.split(' ')[0]);
                        setPage('units');
                      }}
                    >
                      Units
                    </button>
                    <button 
                      className="op-btn op-btn-outline op-btn-sm" 
                      title="Edit" 
                      onClick={e => openEditProp(prop, e)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="op-btn op-btn-danger op-btn-sm" 
                      title="Delete" 
                      onClick={e => { e.stopPropagation(); deleteProp(prop); }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <button 
                  className="op-btn op-btn-outline op-btn-sm" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                  onClick={e => openAddUnit(prop.id, e)}
                >
                  <FaPlus /> Add Unit
                </button>
              </div>
            </div>
          );
        })}
        {filtProps.length === 0 && (
          <div style={{ gridColumn: '1/-1' }} className="op-empty">
            No properties found. 
            <button className="op-btn op-btn-primary op-btn-sm" style={{ marginLeft: 10 }} onClick={openAddProp}>
              Add one →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}