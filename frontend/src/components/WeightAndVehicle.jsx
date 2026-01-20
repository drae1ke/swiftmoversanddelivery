import React, { useState } from 'react';
import '../styles/WeightAndVehicle.css';

const WeightAndVehicle = ({ service, onWeightChange, onVehicleChange }) => {
  const [weight, setWeight] = useState(10);
  const [vehicle, setVehicle] = useState('');
  
  const vehicles = service === 'Delivery' 
    ? ['Bike', 'Car', 'Van'] 
    : ['Van', 'Truck', 'Large Truck'];

  const handleWeightChange = (e) => {
    const value = parseInt(e.target.value);
    setWeight(value);
    if (onWeightChange) onWeightChange(value);
  };

  const handleVehicleChange = (selectedVehicle) => {
    setVehicle(selectedVehicle);
    if (onVehicleChange) onVehicleChange(selectedVehicle);
  };

  return (
    <div className="weight-vehicle-container">
      {/* Weight Slider */}
      <div className="weight-section">
        <div className="weight-header">
          <label className="weight-label">Package Weight</label>
          <span className="weight-value">{weight} kg</span>
        </div>
        <input
          type="range"
          min="1"
          max="1000"
          step="5"
          value={weight}
          onChange={handleWeightChange}
          className="weight-slider"
        />
        <div className="weight-marks">
          <span>1 kg</span>
          <span>500 kg</span>
          <span>1000 kg</span>
        </div>
      </div>

      {/* Vehicle Selector */}
      <div className="vehicle-section">
        <label className="vehicle-label">Select Vehicle</label>
        <div className="vehicle-grid">
          {vehicles.map((v) => (
            <div
              key={v}
              className={`vehicle-card ${vehicle === v ? 'selected' : ''}`}
              onClick={() => handleVehicleChange(v)}
            >
              <i className={`fas ${
                v === 'Bike' ? 'fa-motorcycle' :
                v === 'Car' ? 'fa-car' :
                v === 'Van' ? 'fa-shuttle-van' :
                v === 'Truck' ? 'fa-truck' :
                'fa-truck-moving'
              } vehicle-icon`}></i>
              <span className="vehicle-name">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeightAndVehicle;