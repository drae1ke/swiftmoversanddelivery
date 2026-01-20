import React from 'react';
import '../styles/About.css';
import aboutImage from '../assets/swiftmovershero.jpg';
const About = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-image-wrapper">
          <img 
            src={aboutImage} 
            alt="Swift Deliver Team" 
            className="about-image"
          />
        </div>
        <div className="about-content">
          <h2 className="about-title">About SwiftDeliver</h2>
          <p className="about-description">
            SwiftDeliver is Kenya's leading logistics platform, revolutionizing the way 
            packages move across all 47 counties. Founded with a vision to connect every 
            corner of Kenya, we combine cutting-edge technology with local expertise to 
            provide reliable, affordable, and fast delivery services.
          </p>
          <p className="about-description">
            Our smart routing system accounts for Kenya's unique terrain and traffic 
            patterns, ensuring your packages arrive on time, every time. From Nairobi 
            to Turkana, Mombasa to Kisumu, we've got you covered.
          </p>
          <a href="a3" className="read-more-link">Read More</a>
          </div>
      </div>
    </section>
  );
};

export default About;