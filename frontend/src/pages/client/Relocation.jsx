import React, { useState } from 'react';
import FormProgress from '../../components/client/FormProgress';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';
import { createRelocationRequest } from '../../api';

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
    temporaryStorage: false,
    itemsDescription: '',
    scheduledDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const addons = [];
      if (formData.packing) addons.push('Professional packing');
      if (formData.furnitureAssembly) addons.push('Furniture disassembly/reassembly');
      if (formData.applianceDisconnect) addons.push('Appliance disconnection/reconnection');
      if (formData.temporaryStorage) addons.push('Temporary storage');

      const result = await createRelocationRequest({
        pickupAddress: `${formData.currentAddress}, ${formData.currentCounty}`,
        destinationAddress: `${formData.destAddress}, ${formData.destCounty}`,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate).toISOString()
          : new Date(Date.now() + 7 * 86400000).toISOString(),
        itemsDescription: formData.itemsDescription || `${formData.moveType} move — ${formData.homeSize}`,
        estimatedVolume: formData.homeSize,
        vehicleType: 'lorry',
        serviceType: 'Standard',
        notes: addons.length ? `Add-ons: ${addons.join(', ')}` : '',
      });
      setSuccessData(result);
    } catch (err) {
      setError(err.message || 'Failed to submit relocation request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      if (!formData.currentAddress || !formData.destAddress) {
        setError('Please fill in both current and destination addresses.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!formData.itemsDescription) {
        setError('Please describe the items to be moved.');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      await handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onShowPage('services');
    }
  };

  // navigation/back logic is above; no duplicate here

  const handleBackToServices = () => {
    setSuccessData(null);
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
        {/* hide progress bar once we have a success response */}
        {!successData && <FormProgress steps={steps} currentStep={step} />}

        {error && (
          <div style={{ color: '#e53e3e', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>
        )}

        {/* Step 1: Move Details */}
        {step === 1 && !successData && (
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
              <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Inventory Details */}
        {step === 2 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Inventory Details</div>
            <div className="field-group">
              <div className="field">
                <label>Brief description of items</label>
                <textarea
                  placeholder="e.g. 3 sofas, 2 beds, boxes of kitchenware…"
                  value={formData.itemsDescription}
                  onChange={(e) => setFormData({...formData, itemsDescription: e.target.value})}
                ></textarea>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Schedule Move</div>
            <div className="field-group">
              <div className="field">
                <label>Preferred date</label>
                <input
                  type="date"
                  value={formData.scheduledDate ? formData.scheduledDate.substring(0,10) : ''}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request →'}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {successData && (
          <SuccessCard
            icon="🏠"
            title="Relocation Request Sent!"
            message={`Your ${formData.moveType.toLowerCase()} relocation from ${formData.currentCounty} to ${formData.destCounty} has been submitted. Estimated cost: KES ${successData.price?.toLocaleString() || '—'}. Our team will confirm details shortly.`}
            trackingCode={successData._id}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Relocation;