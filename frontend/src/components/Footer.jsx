import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          {/* Company Info */}
          <div className="footer-column">
            <h3 className="footer-logo">SwiftDeliver</h3>
            <p className="footer-description">
              Kenya's leading logistics platform connecting all 47 counties with 
              reliable, fast, and affordable delivery services.
            </p>
            <div className="footer-social">
              <a href="#facebook" className="social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#twitter" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#instagram" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><a href="#same-day">Same Day Delivery</a></li>
              <li><a href="#express">Express Shipping</a></li>
              <li><a href="#cargo">Cargo Transport</a></li>
              <li><a href="#tracking">Package Tracking</a></li>
              <li><a href="#insurance">Delivery Insurance</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Nairobi, Kenya</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>+254 700 123 456</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>info@swiftdeliver.co.ke</span>
              </li>
              <li>
                <i className="fas fa-clock"></i>
                <span>Mon - Sat: 8AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              &copy; {currentYear} SwiftDeliver. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;