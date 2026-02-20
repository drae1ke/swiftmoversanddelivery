import React from 'react';

const SuccessCard = ({ icon, title, message, trackingCode, onBack }) => {
  return (
    <div className="success-card">
      <div className="success-icon">{icon}</div>
      <div className="success-title">{title}</div>
      <div className="success-msg">{message}</div>
      <div className="tracking-code">
        <div className="tracking-code-label">Tracking Code</div>
        <div className="tracking-code-val">{trackingCode}</div>
      </div>
      <button 
        className="btn btn-primary" 
        onClick={onBack}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Back to Services
      </button>
    </div>
  );
};

export default SuccessCard;