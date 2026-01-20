// Hero Section Component
import React from 'react';
import hero from '../assets/hero.jpg'
import '../styles/HeroSection.css';
function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <img  src={hero} alt="hero section image" />
        <div className="hero-content">
          <h2>Reliable Last Mile Delivery & Movers</h2>
          <p>Quality courier services and order fulfillment solutions for individuals,
             businesses, service providers and NGOs across Kenya</p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection