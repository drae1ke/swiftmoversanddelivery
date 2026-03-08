import React from 'react';
import { FaMapMarkerAlt, FaRulerCombined, FaTag } from 'react-icons/fa';

const STORAGE_TYPE_LABELS = {
  room: 'Room',
  garage: 'Garage',
  warehouse: 'Warehouse',
  container: 'Container',
  basement: 'Basement',
  attic: 'Attic',
  other: 'Storage',
};

const AVAILABILITY_CONFIG = {
  available: { label: 'Available', cls: 'sc-badge-available' },
  reserved: { label: 'Reserved', cls: 'sc-badge-reserved' },
  unavailable: { label: 'Unavailable', cls: 'sc-badge-unavailable' },
};

const StorageCard = ({ unit, onBook }) => {
  const avail = AVAILABILITY_CONFIG[unit.availability] || AVAILABILITY_CONFIG.available;
  const typeLabel = STORAGE_TYPE_LABELS[unit.storageType] || unit.storageType || 'Storage';
  const isBookable = unit.availability === 'available';

  return (
    <div className="storage-card">
      {/* Image / header */}
      <div className="storage-card-img">
        {unit.images && unit.images.length > 0 ? (
          <img src={unit.images[0]} alt={unit.title} className="sc-img" />
        ) : (
          <div className="sc-no-img">
            <FaMapMarkerAlt size={28} />
            <span>{typeLabel}</span>
          </div>
        )}
        <span className={`storage-card-badge ${avail.cls}`}>{avail.label}</span>
        <span className="sc-type-tag">{typeLabel}</span>
      </div>

      <div className="storage-card-body">
        <div className="storage-card-name">{unit.title}</div>

        <div className="storage-card-loc">
          <FaMapMarkerAlt size={10} />
          {unit.address}
        </div>

        {/* Size + price row */}
        <div className="sc-detail-row">
          <span className="sc-detail">
            <FaRulerCombined size={10} />
            {unit.sizeSqFt ? `${unit.sizeSqFt.toLocaleString()} sq ft` : 'Size TBC'}
          </span>
        </div>

        {/* Amenity tags */}
        {unit.amenities && unit.amenities.length > 0 && (
          <div className="storage-card-tags">
            {unit.amenities.slice(0, 4).map((a, i) => (
              <span key={i} className="storage-tag">
                {a.replace(/-/g, ' ')}
              </span>
            ))}
            {unit.amenities.length > 4 && (
              <span className="storage-tag">+{unit.amenities.length - 4}</span>
            )}
          </div>
        )}

        <div className="storage-card-footer">
          <div className="storage-price">
            {unit.pricePerMonth
              ? <>KES {Number(unit.pricePerMonth).toLocaleString()} <span>/month</span></>
              : <span>Price TBC</span>
            }
          </div>
          <button
            className={`storage-book-btn ${!isBookable ? 'storage-book-btn-disabled' : ''}`}
            onClick={() => isBookable && onBook(unit)}
            disabled={!isBookable}
          >
            {isBookable ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageCard;