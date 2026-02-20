import React from 'react';
import { FaSearchLocation } from 'react-icons/fa';
const StorageCard = ({ unit, onBook }) => {
  const badgeClass = unit.status === 'available' ? 'available' : 'limited';
  
  return (
    <div className="storage-card">
      <div className="storage-card-img">
        {unit.icon}
        <span className={`storage-card-badge ${badgeClass}`}>
          {unit.status === 'available' ? 'Available' : unit.badgeText}
        </span>
      </div>
      <div className="storage-card-body">
        <div className="storage-card-name">{unit.name}</div>
        <div className="storage-card-loc"> <FaSearchLocation/> {unit.location}</div>
        <div className="storage-card-tags">
          {unit.tags.map((tag, i) => (
            <span key={i} className="storage-tag">{tag}</span>
          ))}
        </div>
        <div className="storage-card-footer">
          <div className="storage-price">
            {unit.price} <span>/month</span>
          </div>
          <button 
            className="storage-book-btn" 
            onClick={() => onBook(unit)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageCard;