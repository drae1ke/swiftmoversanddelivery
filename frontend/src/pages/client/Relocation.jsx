import React, { useState } from 'react';
import FormProgress from '../../components/client/FormProgress';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';

const Relocation = ({ isActive, onShowPage }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    moveType: 'Residential',
    currentCounty: 'Nairobi',
    destCounty: 'Nakuru',
    currentAddress: '',
    destAddress: '',
    homeSize: 'Bedsitter',
    packing: true,
    furnitureAssembly: false,
    applianceDisconnect: false,
    temporaryStorage: false
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNextStep = (nextStep) => {
    setStep(nextStep);
  };

  const handleBack = () => {
    onShowPage('services');
  };

  const handleRequestQuote = () => {
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

  const handleCheckboxChange = (field) => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const steps = ['Move Details', 'Inventory', 'Schedule'];

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-relocation">
      <div className="page-header">
        <div className="page-tag">Relocation Service</div>
        <h1 className="page-title">Plan Your <span>Move</span></h1>
        <p className="page-desc">Tell us about your relocation. We'll send a trained crew with the right vehicles for your load.</p>
      </div>

      <div className="form-shell">
        {!showSuccess && <FormProgress steps={steps} currentStep={step} />}

        {/* Step 1: Move Details */}
        {step === 1 && !showSuccess && (
          <div className="form-card">
            <div className="form-card-title">Move Details</div>
            <div className="field-group">
              <div className="field">
                <label>Move Type</label>
                <div className="radio-grid">
                  <RadioCard 
                    icon="🏠"
                    label="Residential"
                    selected={formData.moveType === 'Residential'}
                    onClick={() => handleRadioSelect('moveType', 'Residential')}
                  />
                  <RadioCard 
                    icon="🏢"
                    label="Office"
                    selected={formData.moveType === 'Office'}
                    onClick={() => handleRadioSelect('moveType', 'Office')}
                  />
                  <RadioCard 
                    icon="🏬"
                    label="Commercial"
                    selected={formData.moveType === 'Commercial'}
                    onClick={() => handleRadioSelect('moveType', 'Commercial')}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Current County</label>
                  <select 
                    value={formData.currentCounty}
                    onChange={(e) => setFormData({...formData, currentCounty: e.target.value})}
                  >
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                    <option>Kisumu</option>
                    <option>Nakuru</option>
                    <option>Eldoret</option>
                    <option>Thika</option>
                  </select>
                </div>
                <div className="field">
                  <label>Destination County</label>
                  <select 
                    value={formData.destCounty}
                    onChange={(e) => setFormData({...formData, destCounty: e.target.value})}
                  >
                    <option>Nakuru</option>
                    <option>Nairobi</option>
                    <option>Kisumu</option>
                    <option>Mombasa</option>
                    <option>Eldoret</option>
                    <option>Thika</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Current Address</label>
                <input 
                  type="text" 
                  placeholder="Full address including estate/building"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                />
              </div>
              <div className="field">
                <label>Destination Address</label>
                <input 
                  type="text" 
                  placeholder="Full address of your new place"
                  value={formData.destAddress}
                  onChange={(e) => setFormData({...formData, destAddress: e.target.value})}
                />
              </div>
              <div className="field">
                <label>Home Size</label>
                <div className="radio-grid">
                  <RadioCard 
                    label="Bedsitter"
                    selected={formData.homeSize === 'Bedsitter'}
                    onClick={() => handleRadioSelect('homeSize', 'Bedsitter')}
                  />
                  <RadioCard 
                    label="1 Bedroom"
                    selected={formData.homeSize === '1 Bedroom'}
                    onClick={() => handleRadioSelect('homeSize', '1 Bedroom')}
                  />
                  <RadioCard 
                    label="2 Bedroom"
                    selected={formData.homeSize === '2 Bedroom'}
                    onClick={() => handleRadioSelect('homeSize', '2 Bedroom')}
                  />
                </div>
                <div className="radio-grid" style={{ marginTop: '10px' }}>
                  <RadioCard 
                    label="3 Bedroom"
                    selected={formData.homeSize === '3 Bedroom'}
                    onClick={() => handleRadioSelect('homeSize', '3 Bedroom')}
                  />
                  <RadioCard 
                    label="4+ Bedroom"
                    selected={formData.homeSize === '4+ Bedroom'}
                    onClick={() => handleRadioSelect('homeSize', '4+ Bedroom')}
                  />
                  <RadioCard 
                    label="Office/Retail"
                    selected={formData.homeSize === 'Office/Retail'}
                    onClick={() => handleRadioSelect('homeSize', 'Office/Retail')}
                  />
                </div>
              </div>
              <div className="field">
                <label>Add-on Services</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  <label className="filter-opt">
                    <input 
                      type="checkbox" 
                      checked={formData.packing}
                      onChange={() => handleCheckboxChange('packing')}
                    />
                    <span>Professional packing &amp; boxing</span>
                  </label>
                  <label className="filter-opt">
                    <input 
                      type="checkbox" 
                      checked={formData.furnitureAssembly}
                      onChange={() => handleCheckboxChange('furnitureAssembly')}
                    />
                    <span>Furniture disassembly &amp; reassembly</span>
                  </label>
                  <label className="filter-opt">
                    <input 
                      type="checkbox" 
                      checked={formData.applianceDisconnect}
                      onChange={() => handleCheckboxChange('applianceDisconnect')}
                    />
                    <span>Appliance disconnection &amp; reconnection</span>
                  </label>
                  <label className="filter-opt">
                    <input 
                      type="checkbox" 
                      checked={formData.temporaryStorage}
                      onChange={() => handleCheckboxChange('temporaryStorage')}
                    />
                    <span>Temporary storage (if needed)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleRequestQuote}>Request Quote →</button>
            </div>
          </div>
        )}

        {/* Success */}
        {showSuccess && (
          <SuccessCard
            icon="🏠"
            title="Relocation Request Sent!"
            message="Our team will call you within 2 hours to confirm your moving date, finalize inventory, and share a fixed price quote."
            trackingCode="RL-2025-09342"
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Relocation;