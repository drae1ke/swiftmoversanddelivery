import React, { useState } from 'react';
import '../styles/Header.css';
import { FaSearchLocation } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import {Link} from 'react-router-dom';
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
    <header className="header">
      <div className="container">
        <div className="header-info">
          <span><FaSearchLocation /> <span>Kenya</span></span>
          <span><FaClock /> <span>24hrs Open</span></span>
          <span>
            <a href="mailto:phelleeks@gmail.com">phelleeks@gmail.com</a>
             </span>
            <span>
              <a href="tel:+254700000000">+254 700 000 000</a>
            </span>
            <div className='social-icons'>
              <a href="https://www.facebook.com"><FaFacebookF /></a>
              <a href="https://www.twitter.com"><FaTwitter /></a>
              <a href="https://www.instagram.com"><FaInstagram /></a>
            </div>
        </div>
        <div className="nav">
          <h1 className="logo">Swift Movers & Delivery</h1>
          <button
            className={"hamburger" + (open ? ' open' : '')}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav className={open ? 'open' : ''}>
            <ul className="nav-links">
              <li><a href="#home" onClick={() => setOpen(false)}>Home</a></li>
              <li><a href="#services" onClick={() => setOpen(false)}>Services</a></li>
              <li><a href="#about" onClick={() => setOpen(false)}>About Us</a></li>
              <li><a href="#contact" onClick={() => setOpen(false)}>Contact</a></li>
              <li><a href="#Tracking" onClick={() => setOpen(false)}>Tracking</a></li>
              <li><a href="Login" onClick={() => setOpen(false)}>Log in</a></li>
              <li><a href="Signup" onClick={() => setOpen(false)}>Register</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    </>
  );
}

export default Header