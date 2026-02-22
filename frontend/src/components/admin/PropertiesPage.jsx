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
        <span style={{ fontSize: '.79rem', color: 'var(--muted)' }}>{filtProps.length} properties</span>
      </div>
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
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
              {filtProps.map(p => (
                <tr key={p.id}>
                  <td><div className="ap-td-name">{p.name}</div></td>
                  <td style={{ fontSize: '.84rem' }}>{p.owner}</td>
                  <td style={{ fontFamily: 'var(--font-d)', fontSize: '.95rem' }}>{p.units}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border-l)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: p.occupied === 0 ? 'var(--red)' : p.occupied === p.units ? 'var(--green)' : 'var(--amber)', 
                          width: `${p.units ? Math.round(p.occupied / p.units * 100) : 0}%`, 
                          borderRadius: 99 
                        }} />
                      </div>
                      <span style={{ fontSize: '.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {p.units ? Math.round(p.occupied / p.units * 100) : 0}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-d)', fontSize: '.9rem' }}>
                    KES {p.revenue.toLocaleString()}
                  </td>
                  <td><span className={`ap-pill ap-pill-${p.status}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}