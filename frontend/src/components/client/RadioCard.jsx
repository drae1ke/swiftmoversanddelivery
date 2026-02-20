import React from 'react';

const RadioCard = ({ icon, label, sublabel, selected, onClick }) => {
  return (
    <div 
      className={`radio-card ${selected ? 'selected' : ''}`} 
      onClick={onClick}
    >
      {icon && <div className="radio-card-icon">{icon}</div>}
      <div className="radio-card-label">
        {label}
        {sublabel && <br />}
        {sublabel && <small>{sublabel}</small>}
      </div>
    </div>
  );
};

export default RadioCard;