import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function PropertiesPage({ active, filtProps, propSearch, setPropSearch }) {
  if (!active) return null;

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">Storage</div>
        <h1 className="ap-page-title">All <span>Properties</span></h1>
        <p className="ap-page-desc">View and manage all registered storage properties on the platform.</p>
      </div>

      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search by property or owner…" 
            value={propSearch} 
            onChange={e => setPropSearch(e.target.value)} 
          />
        </div>
        <span className="ap-meta">
          {filtProps.length} properties
        </span>
      </div>

      <div className="ap-card">
        <div className="ap-table-wrap">
          {filtProps.length === 0 ? (
            <div className="ap-empty">
              No properties match your search. Try adjusting your filters.
            </div>
          ) : (
            <table className="ap-table ap-table--no-hover">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Units</th>
                  <th>Occupancy</th>
                  <th>Revenue/mo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtProps.map(p => {
                  const pct = p.units ? Math.round((p.occupied / p.units) * 100) : 0;
                  const barColor = p.occupied === 0 ? 'var(--red)' : p.occupied === p.units ? 'var(--green)' : 'var(--amber)';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="ap-td-name">{p.name}</div>
                      </td>
                      <td className="ap-td-muted">{p.owner}</td>
                      <td className="ap-td-numeric">{p.units}</td>
                      <td>
                        <div className="ap-occupancy">
                          <div className="ap-occupancy-bar" style={{ width: `${pct}%`, background: barColor }} />
                          <span className="ap-occupancy-label">{pct}%</span>
                        </div>
                      </td>
                      <td className="ap-td-numeric">KES {p.revenue.toLocaleString()}</td>
                      <td><span className={`ap-pill ap-pill-${p.status}`}>{p.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}