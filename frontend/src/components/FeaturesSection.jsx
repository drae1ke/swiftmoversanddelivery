import React from 'react';
import '../styles/FeaturesSection.css';
import { FaMapMarkerAlt, FaBox, FaClock, FaShieldAlt } from 'react-icons/fa';
const FeaturesSection = () => {
  const features = [
    {
      icon: FaMapMarkerAlt,
      title: "Geo-Encoded Routes",
      description: "Smart routing across all 47 Kenyan counties with real-time traffic updates",
    },
    {
      icon: FaBox,
      title: "Flexible Packages",
      description: "From documents to large cargo, we handle all luggage types with care",
    },
    {
      icon: FaClock,
      title: "Dynamic Pricing",
      description: "Transparent pricing based on distance, terrain, and delivery speed",
    },
    {
      icon: FaShieldAlt,
      title: "Secure Delivery",
      description: "Track your package in real-time with verified drivers",
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Why Choose SwiftDeliver?
          </h2>
          <p className="features-subtitle">
            Built specifically for Kenya's unique delivery challenges, with smart 
            pricing that accounts for real conditions.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-card-content">
                <div className="feature-icon-wrapper">
                  {(() => {
                    const Icon = feature.icon;
                    return <Icon className="feature-icon" />;
                  })()}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;