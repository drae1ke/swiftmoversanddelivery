import React from 'react';

const Services = ({ isActive, onShowPage }) => {
  const services = [
    {
      id: 'delivery',
      icon: '📦',
      title: 'Send a Package',
      desc: 'Same-day or standard delivery across Kenya. Track your parcel in real-time from pickup to drop-off.',
      arrow: 'Request Delivery'
    },
    {
      id: 'relocation',
      icon: '🏠',
      title: 'Move Home or Office',
      desc: 'Full relocation service — we handle packing, loading, transport, and placement at your new space.',
      arrow: 'Plan Relocation'
    },
    {
      id: 'cargo',
      icon: '🚛',
      title: 'Ship Cargo',
      desc: 'Heavy goods, bulk orders, commercial freight — with load tracking and delivery confirmation.',
      arrow: 'Book Cargo'
    },
    {
      id: 'storage',
      icon: '🏢',
      title: 'Find Storage Space',
      desc: 'Browse secure, insured storage units across major Kenyan towns. Filter by size, price, and location.',
      arrow: 'Browse Spaces'
    }
  ];

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-services">
      <div className="page-header">
        <div className="page-tag">Welcome back, James</div>
        <h1 className="page-title">What would you like<br /><span>to do today?</span></h1>
        <p className="page-desc">Choose a service below. Each form is focused — no distractions, just what you need.</p>
      </div>

      <div className="service-grid">
        {services.map(service => (
          <div 
            key={service.id}
            className="service-card" 
            onClick={() => onShowPage(service.id)}
          >
            <div className="service-card-icon">{service.icon}</div>
            <div className="service-card-title">{service.title}</div>
            <div className="service-card-desc">{service.desc}</div>
            <div className="service-card-arrow">{service.arrow} <span>→</span></div>
          </div>
        ))}

        <div 
          className="service-card" 
          onClick={() => onShowPage('tracking')}
          style={{ gridColumn: '1/-1', flexDirection: 'row', alignItems: 'center', gap: '24px' }}
        >
          <div className="service-card-icon" style={{ marginBottom: 0, fontSize: '2rem' }}>📍</div>
          <div style={{ flex: 1 }}>
            <div className="service-card-title">Track a Shipment</div>
            <div className="service-card-desc" style={{ maxWidth: '480px' }}>
              Enter a tracking code to see live status, timeline, route details, and driver info for any active delivery.
            </div>
          </div>
          <div className="service-card-arrow" style={{ marginTop: 0, flexShrink: 0 }}>
            Track Now <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;