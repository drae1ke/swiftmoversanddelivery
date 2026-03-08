import React from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaWarehouse, FaMapMarkerAlt } from 'react-icons/fa';

const STORAGE_TYPE_LABELS = {
  room: 'Room',
  garage: 'Garage',
  warehouse: 'Warehouse',
  container: 'Container',
  basement: 'Basement',
  attic: 'Attic',
  other: 'Other',
};

const AVAILABILITY_CLASS = {
  available: 'op-avail-available',
  unavailable: 'op-avail-unavailable',
  reserved: 'op-avail-reserved',
};

const STATUS_CLASS = {
  active: 'op-pill-green',
  approved: 'op-pill-green',
  pending: 'op-pill-amber',
  inactive: 'op-pill-muted',
  rejected: 'op-pill-red',
};

export default function PropertiesPage({
  active,
  filtProps,
  propSearch,
  setPropSearch,
  openAddProp,
  openEditProp,
  deleteProp,
  openAddUnit,
  setPage,
  setUnitSearch,
}) {
  if (!active) return null;

  return (
    <div className="op-page active">
      <div className="op-page-hdr">
        <div>
          <div className="op-page-tag">Storage Portfolio</div>
          <h1 className="op-page-title">My Properties</h1>
          <p className="op-page-desc">Manage your storage spaces — view details, edit listings, and track availability.</p>
        </div>
        <button className="op-btn op-btn-primary" onClick={openAddProp}>
          <FaPlus size={12} /> Add Property
        </button>
      </div>

      {/* Search */}
      <div className="op-toolbar">
        <div className="op-search-wrap">
          <span className="op-search-icon"><FaSearch size={12} /></span>
          <input
            placeholder="Search by title or address…"
            value={propSearch}
            onChange={e => setPropSearch(e.target.value)}
          />
        </div>
        <span className="op-count-lbl">{filtProps.length} {filtProps.length === 1 ? 'property' : 'properties'}</span>
      </div>

      {filtProps.length === 0 ? (
        <div className="op-empty-state">
          <FaWarehouse size={32} className="op-empty-icon" />
          <div className="op-empty-title">No properties yet</div>
          <div className="op-empty-desc">Add your first storage property to start managing your portfolio.</div>
          <button className="op-btn op-btn-primary" onClick={openAddProp}>
            <FaPlus size={12} /> Add Property
          </button>
        </div>
      ) : (
        <div className="op-props-grid">
          {filtProps.map(p => {
            const availCls = AVAILABILITY_CLASS[p.availability] || 'op-avail-available';
            const statusCls = STATUS_CLASS[p.status] || 'op-pill-muted';
            const storageLabel = STORAGE_TYPE_LABELS[p.storageType] || p.storageType || 'Storage';

            return (
              <div key={p.id} className="op-prop-card">
                {/* Header band */}
                <div className="op-prop-header-band">
                  <div className="op-prop-type-badge">{storageLabel}</div>
                  <span className={`op-avail-dot ${availCls}`}>
                    {p.availability || 'available'}
                  </span>
                </div>

                <div className="op-prop-body">
                  <div className="op-prop-name">{p.title || p.name}</div>
                  <div className="op-prop-loc">
                    <FaMapMarkerAlt size={10} />
                    {p.address || p.location}
                  </div>

                  {/* Key stats */}
                  <div className="op-prop-stats">
                    <div className="op-psc">
                      <div className="op-psc-v">{p.sizeSqFt ? p.sizeSqFt.toLocaleString() : '—'}</div>
                      <div className="op-psc-l">Sq Ft</div>
                    </div>
                    <div className="op-psc">
                      <div className="op-psc-v">
                        {p.pricePerMonth ? `KES ${Number(p.pricePerMonth).toLocaleString()}` : '—'}
                      </div>
                      <div className="op-psc-l">Per Month</div>
                    </div>
                    <div className="op-psc">
                      <div className="op-psc-v">{p.views ?? 0}</div>
                      <div className="op-psc-l">Views</div>
                    </div>
                  </div>

                  {/* Amenities preview */}
                  {p.amenities && p.amenities.length > 0 && (
                    <div className="op-prop-amenities">
                      {p.amenities.slice(0, 4).map(a => (
                        <span key={a} className="op-amenity-tag">
                          {a.replace(/-/g, ' ')}
                        </span>
                      ))}
                      {p.amenities.length > 4 && (
                        <span className="op-amenity-tag op-amenity-more">
                          +{p.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="op-prop-foot">
                    <span className={`op-pill ${statusCls}`}>{p.status || 'pending'}</span>
                    <div className="op-prop-actions">
                      <button
                        className="op-btn op-btn-xs op-btn-outline"
                        onClick={e => openEditProp(p, e)}
                        title="Edit property"
                      >
                        <FaEdit size={11} /> Edit
                      </button>
                      <button
                        className="op-btn op-btn-xs op-btn-danger-outline"
                        onClick={() => deleteProp(p)}
                        title="Delete property"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}