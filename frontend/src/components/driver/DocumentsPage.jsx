import React from 'react';
import { FaIdCard, FaTruck, FaFileAlt, FaTag, FaEye } from 'react-icons/fa';

export default function DocumentsPage({ active, docs, toast }) {
  if (!active) return null;

  const getIcon = (icon) => {
    switch(icon) {
      case '🪪': return <FaIdCard />;
      case '🚛': return <FaTruck />;
      case '📋': return <FaFileAlt />;
      case '🏷️': return <FaTag />;
      default: return <FaFileAlt />;
    }
  };

  const DOC_STATUS = {
    valid: 'dp-pill-active',
    expiring: 'dp-pill-pending',
    expired: 'dp-pill-cancelled'
  };

  return (
    <div className="dp-page active">
      <div className="dp-page-header">
        <div className="dp-tag">Compliance</div>
        <h1 className="dp-page-title">My <span>Documents</span></h1>
        <p className="dp-page-desc">Track licence, insurance, and vehicle compliance documents.</p>
      </div>
      <div className="dp-doc-list">
        {docs.map(d => (
          <div key={d.id} className="dp-doc-row">
            <div className="dp-doc-icon">{getIcon(d.icon)}</div>
            <div className="dp-doc-info">
              <div className="dp-doc-name">{d.name}</div>
              <div className="dp-doc-meta">{d.issuer} · Expires: {d.expiry}</div>
            </div>
            <span className={`dp-pill ${DOC_STATUS[d.status]}`}>{d.status}</span>
            <div className="dp-doc-actions">
              <button className="dp-btn dp-btn-outline dp-btn-xs" onClick={() => toast(`Viewing ${d.name}`)}>
                <FaEye /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}