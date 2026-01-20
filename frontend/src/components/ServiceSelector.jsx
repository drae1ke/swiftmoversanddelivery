import React, { useState } from 'react';
import '../styles/ServiceSelector.css';

const ServiceSelector = ({ onChange }) => {
  const [service, setService] = useState('Delivery');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [receipientName, setReceipientName] = useState('');
  const [receipientContact, setReceipientContact] = useState('');

  const handleChange = (selectedService) => {
    setService(selectedService);
    if (onChange) {
      onChange(selectedService);
    }
  };


  return (
    <section className="service-selector-section">
     <div className="service-selector">
      <h3 className="service-selector-title">Select Service</h3>
      <div className="service-options">
        <label 
          className={`service-option ${service === 'Delivery' ? 'active' : ''}`}
          onClick={() => handleChange('Delivery')}
        >
          <input
            type="radio"
            name="service"
            value="Delivery"
            checked={service === 'Delivery'}
            onChange={(e) => handleChange(e.target.value)}
            className="service-radio"
          />
          <div className="service-card">
            <i className="fas fa-box service-icon"></i>
            <span className="service-label">Delivery</span>
            <p className="service-description">Fast package delivery</p>
          </div>
        </label>

        <label 
          className={`service-option ${service === 'Moving' ? 'active' : ''}`}
          onClick={() => handleChange('Moving')}
        >
          <input
            type="radio"
            name="service"
            value="Moving"
            checked={service === 'Moving'}
            onChange={(e) => handleChange(e.target.value)}
            className="service-radio"
          />
          <div className="service-card">
            <i className="fas fa-truck-moving service-icon"></i>
            <span className="service-label">Moving</span>
            <p className="service-description">Large items & relocation</p>
          </div>
        </label>
      </div>
    </div>
         <div className='map-section'>
          <div className="map-box">
            <h3 className="map-box-title">Map Placeholder</h3>
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt map-icon"></i>
              <p className="map-text">Map will be displayed here</p>
            </div>
          </div>
          <div className="delivery-info">
            <h3 className="delivery-info-title">Delivery Information</h3>
            <p className="delivery-info-text">Please enter pickup and drop-off locations to see delivery details.</p>
            <form action="">
              <div className="form-group">
                <label htmlFor="pickup"
                 className="form-label">Pickup Location</label>
                <input type="text"
                 id="pickup"
                 name="pickup"
                 className="form-input"
                 placeholder="Enter pickup location" 
                 value={pickupLocation}
                 onChange={(e) => setPickupLocation(e.target.value)}
                 />
              </div>
              <div className="form-group">
                <label htmlFor="dropoff"
                className="form-label">Drop-off Location</label>
                <input type="text"
                id="dropoff"
                name="dropoff"
                className="form-input"
                placeholder="Enter drop-off location"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                 />
              </div>
            </form>
          </div>
         </div>
         <div className="receipient-details">
      <h3 className="receipient-details-title">Receipient Details</h3>
      <form action="">
        <div className="form-group"> 
          <label htmlFor="receipientName" className="form-label">Receipient Name</label>
          <input
            type="text"
            id="receipientName"
            name="receipientName"
            className="form-input"
            placeholder="Enter receipient's name"
            value={receipientName}
            onChange={(e) => setReceipientName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="receipientContact" className="form-label">Receipient Contact</label>
          <input
            type="text"
            id="receipientContact"
            name="receipientContact"
            className="form-input"
            placeholder="Enter receipient's contact"
            value={receipientContact}
            onChange={(e) => setReceipientContact(e.target.value)}
          />
        </div>
      </form>
         </div>
    </section>
   
  );
};

export default ServiceSelector;