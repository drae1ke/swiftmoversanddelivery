import React from 'react';
import '../styles/FaqSection.css';
import { FaMapMarkerAlt, FaBoxOpen, FaShippingFast } from 'react-icons/fa';

const FaqSection = () => {
  const steps = [
    {
      step: '1',
      title: 'Select Locations',
      desc: 'Choose pickup and delivery points across Kenya',
      icon: FaMapMarkerAlt,
    },
    {
      step: '2',
      title: 'Choose Package Type',
      desc: 'Select your luggage type for accurate pricing',
      icon: FaBoxOpen,
    },
    {
      step: '3',
      title: 'Track & Receive',
      desc: 'Monitor your delivery in real-time until arrival',
      icon: FaShippingFast,
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <h2 className="how-it-works-title">
            How It Works
          </h2>
        </div>
        <div className="steps-grid">
          {steps.map((item, index) => (
            <div key={index} className="step-item">
              <div className="step-number">
                {item.step}
              </div>
              <div className="step-icon-wrapper">
                {(() => {
                  const Icon = item.icon;
                  return <Icon className="step-icon" />;
                })()}
              </div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-description">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;