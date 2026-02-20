import React, { useState } from 'react';
import FormProgress from '../../components/client/FormProgress';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';

const Cargo = ({ isActive, onShowPage }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cargoType: 'General Goods',
    weight: '',
    volume: '',
    vehicle: 'Pickup',
    originCounty: 'Nairobi',
    destCounty: 'Eldoret',
    pickupDate: '',
    insurance: 'Yes',
    requirements: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNextStep = (nextStep) => {
    setStep(nextStep);
  };

  const handleBack = () => {
    onShowPage('services');
  };

  const handleGetQuote = () => {
    setShowSuccess(true);
  };

  const handleBackToServices = () => {
    setShowSuccess(false);
    setStep(1);
    onShowPage('services');
  };

  const handleRadioSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const steps = ['Cargo Info', 'Route', 'Confirm'];

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-cargo">
      <div className="page-header">
        <div className="page-tag">Cargo Transport</div>
        <h1 className="page-title">Book <span>Cargo Delivery</span></h1>
        <p className="page-desc">For bulk goods, commercial freight, and heavy loads. All vehicles are GPS-tracked and insured.</p>
      </div>

      <div className="form-shell">
        {!showSuccess && <FormProgress steps={steps} currentStep={step} />}

        {/* Step 1: Cargo Info */}
        {step === 1 && !showSuccess && (
          <div className="form-card">
            <div className="form-card-title">Cargo Details</div>
            <div className="field-group">
              <div className="field">
                <label>Cargo Type</label>
                <select 
                  value={formData.cargoType}
                  onChange={(e) => setFormData({...formData, cargoType: e.target.value})}
                >
                  <option>General Goods</option>
                  <option>Agricultural Produce</option>
                  <option>Construction Materials</option>
                  <option>Industrial Equipment</option>
                  <option>Perishables (Refrigerated)</option>
                  <option>Hazardous Materials</option>
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Total Weight (tonnes)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
                <div className="field">
                  <label>Total Volume (m³)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10"
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                  />
                </div>
              </div>
              <div className="field">
                <label>Vehicle Required</label>
                <div className="radio-grid">
                  <RadioCard 
                    icon="🚐"
                    label="Pickup"
                    sublabel="Up to 1T"
                    selected={formData.vehicle === 'Pickup'}
                    onClick={() => handleRadioSelect('vehicle', 'Pickup')}
                  />
                  <RadioCard 
                    icon="🚚"
                    label="3-Tonne"
                    sublabel="1–3T"
                    selected={formData.vehicle === '3-Tonne'}
                    onClick={() => handleRadioSelect('vehicle', '3-Tonne')}
                  />
                  <RadioCard 
                    icon="🚛"
                    label="14-Tonne"
                    sublabel="3–14T"
                    selected={formData.vehicle === '14-Tonne'}
                    onClick={() => handleRadioSelect('vehicle', '14-Tonne')}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Origin County</label>
                  <select 
                    value={formData.originCounty}
                    onChange={(e) => setFormData({...formData, originCounty: e.target.value})}
                  >
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                    <option>Kisumu</option>
                    <option>Nakuru</option>
                    <option>Eldoret</option>
                  </select>
                </div>
                <div className="field">
                  <label>Destination County</label>
                  <select 
                    value={formData.destCounty}
                    onChange={(e) => setFormData({...formData, destCounty: e.target.value})}
                  >
                    <option>Eldoret</option>
                    <option>Nakuru</option>
                    <option>Kisumu</option>
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Preferred Pickup Date</label>
                <input 
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                />
              </div>
              <div className="field">
                <label>Cargo Insurance</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <RadioCard 
                    icon="🛡️"
                    label="Add Insurance"
                    sublabel="+KES 500"
                    selected={formData.insurance === 'Yes'}
                    onClick={() => handleRadioSelect('insurance', 'Yes')}
                  />
                  <RadioCard 
                    icon="❌"
                    label="No Insurance"
                    sublabel="At own risk"
                    selected={formData.insurance === 'No'}
                    onClick={() => handleRadioSelect('insurance', 'No')}
                  />
                </div>
              </div>
              <div className="field">
                <label>Special Requirements</label>
                <textarea 
                  placeholder="Temperature control, fragile load, loading dock needed…"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                ></textarea>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleGetQuote}>Get Quote →</button>
            </div>
          </div>
        )}

        {/* Success */}
        {showSuccess && (
          <SuccessCard
            icon="🚛"
            title="Cargo Request Submitted!"
            message="Our logistics team will review your request and send you a price quote within 1 hour. You'll receive an SMS and email confirmation."
            trackingCode="CG-2025-33901"
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Cargo;