import React, { useState } from 'react';
import FormProgress from '../../components/client/FormProgress';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';
import GeoAddressInput from '../../components/common/GeoAddressInput';
import { createOrder } from '../../api';

const Cargo = ({ isActive, onShowPage }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cargoType: 'General Goods',
    weight: '',
    volume: '',
    vehicle: 'Pickup',
    originAddress: '',
    destAddress: '',
    pickupDate: '',
    insurance: 'Yes',
    requirements: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleBack = () => onShowPage('services');

  const handleGetQuote = async () => {
    if (!formData.weight) { setError('Please enter the cargo weight.'); return; }
    if (!formData.originAddress || !formData.destAddress) { setError('Please enter origin and destination addresses.'); return; }

    const vehicleMap = { 'Pickup': 'van', '3-Tonne': 'van', '14-Tonne': 'lorry' };
    try {
      setSubmitting(true);
      setError(null);
      const order = await createOrder({
        pickupAddress: formData.originAddress,
        dropoffAddress: formData.destAddress,
        recipientName: 'Cargo Recipient',
        recipientPhone: '',
        distanceKm: 10,
        packageWeightKg: Number(formData.weight) * 1000,
        vehicleType: vehicleMap[formData.vehicle] || 'lorry',
        serviceType: 'Standard',
        notes: [
          formData.requirements,
          formData.insurance === 'Yes' ? 'Cargo insurance requested' : '',
          formData.volume ? `Volume: ${formData.volume}m³` : '',
        ].filter(Boolean).join(' | '),
      });
      setSuccessData(order);
    } catch (err) {
      setError(err.message || 'Failed to submit cargo request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToServices = () => {
    setSuccessData(null);
    setStep(1);
    onShowPage('services');
  };

  const handleRadioSelect = (field, value) => setFormData({ ...formData, [field]: value });

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
        {!successData && <FormProgress steps={steps} currentStep={step} />}

        {error && <div style={{ color: '#e53e3e', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        {/* Step 1: Cargo Info */}
        {step === 1 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Cargo Details</div>
            <div className="field-group">
              <div className="field">
                <label>Cargo Type</label>
                <select value={formData.cargoType} onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}>
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
                  <input type="number" placeholder="e.g. 2.5" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                </div>
                <div className="field">
                  <label>Total Volume (m³)</label>
                  <input type="number" placeholder="e.g. 10" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Vehicle Required</label>
                <div className="radio-grid">
                  <RadioCard icon="🚐" label="Pickup" sublabel="Up to 1T" selected={formData.vehicle === 'Pickup'} onClick={() => handleRadioSelect('vehicle', 'Pickup')} />
                  <RadioCard icon="🚚" label="3-Tonne" sublabel="1–3T" selected={formData.vehicle === '3-Tonne'} onClick={() => handleRadioSelect('vehicle', '3-Tonne')} />
                  <RadioCard icon="🚛" label="14-Tonne" sublabel="3–14T" selected={formData.vehicle === '14-Tonne'} onClick={() => handleRadioSelect('vehicle', '14-Tonne')} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!formData.weight) { setError('Please enter the cargo weight.'); return; }
                setError(null);
                setStep(2);
              }}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 2: Route (now with GeoAddressInput) */}
        {step === 2 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Route Details</div>
            <div className="field-group">
              <GeoAddressInput
                label="Origin Address"
                placeholder="Where is the cargo being picked up? Tap 📍 for location"
                value={formData.originAddress}
                onChange={(v) => setFormData({ ...formData, originAddress: v })}
              />
              <GeoAddressInput
                label="Destination Address"
                placeholder="Where should the cargo be delivered?"
                value={formData.destAddress}
                onChange={(v) => setFormData({ ...formData, destAddress: v })}
                allowGPS={false}
              />
              <div className="field">
                <label>Preferred Pickup Date</label>
                <input type="date" value={formData.pickupDate} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} />
              </div>
              <div className="field">
                <label>Cargo Insurance</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <RadioCard icon="🛡️" label="Add Insurance" sublabel="+KES 500" selected={formData.insurance === 'Yes'} onClick={() => handleRadioSelect('insurance', 'Yes')} />
                  <RadioCard icon="❌" label="No Insurance" sublabel="At own risk" selected={formData.insurance === 'No'} onClick={() => handleRadioSelect('insurance', 'No')} />
                </div>
              </div>
              <div className="field">
                <label>Special Requirements</label>
                <textarea
                  placeholder="Temperature control, fragile load, loading dock needed…"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={handleGetQuote} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Get Quote →'}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {successData && (
          <SuccessCard
            icon="🚛"
            title="Cargo Request Submitted!"
            message={`Your ${formData.cargoType.toLowerCase()} shipment from ${formData.originAddress} to ${formData.destAddress} has been submitted. Estimated cost: KES ${successData.priceKes?.toLocaleString() || '—'}. Our logistics team will confirm shortly.`}
            trackingCode={successData._id}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Cargo;