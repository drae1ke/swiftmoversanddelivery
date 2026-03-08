import React, { useState } from 'react';
import FormProgress from '../../components/client/FormProgress';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';
import GeoAddressInput from '../../components/common/GeoAddressInput';
import { createRelocationRequest } from '../../api';

const Relocation = ({ isActive, onShowPage }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    moveType: 'Residential',
    currentAddress: '',
    destAddress: '',
    homeSize: 'Bedsitter',
    packing: true,
    furnitureAssembly: false,
    applianceDisconnect: false,
    temporaryStorage: false,
    itemsDescription: '',
    scheduledDate: '',
    preferredTime: 'Morning (8am–12pm)',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.scheduledDate) {
        setError('Please select a moving date.');
        setSubmitting(false);
        return;
      }

      const addons = [];
      if (formData.packing) addons.push('Professional packing');
      if (formData.furnitureAssembly) addons.push('Furniture disassembly/reassembly');
      if (formData.applianceDisconnect) addons.push('Appliance disconnection/reconnection');
      if (formData.temporaryStorage) addons.push('Temporary storage');

      const result = await createRelocationRequest({
        pickupAddress: formData.currentAddress,
        destinationAddress: formData.destAddress,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        itemsDescription: formData.itemsDescription || `${formData.moveType} move — ${formData.homeSize}`,
        estimatedVolume: formData.homeSize,
        vehicleType: 'lorry',
        serviceType: 'Standard',
        notes: [
          formData.preferredTime ? `Preferred time: ${formData.preferredTime}` : '',
          addons.length ? `Add-ons: ${addons.join(', ')}` : '',
        ].filter(Boolean).join(' | '),
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
    if (step > 1) setStep(step - 1);
    else onShowPage('services');
  };

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

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-relocation">
      <div className="page-header">
        <div className="page-tag">Relocation Service</div>
        <h1 className="page-title">Plan Your <span>Move</span></h1>
        <p className="page-desc">Tell us about your relocation. We'll handle packing, loading, transport and placement.</p>
      </div>

      <div className="form-shell">
        {!successData && <FormProgress steps={steps} currentStep={step} />}

        {error && (
          <div style={{ color: '#e53e3e', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>
        )}

        {/* ── Step 1: Move Details ── */}
        {step === 1 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Move Details</div>
            <div className="field-group">
              <div className="field">
                <label>Move Type</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <RadioCard icon="🏠" label="Residential" sublabel="Home / apartment" selected={formData.moveType === 'Residential'} onClick={() => handleRadioSelect('moveType', 'Residential')} />
                  <RadioCard icon="🏢" label="Commercial" sublabel="Office / business" selected={formData.moveType === 'Commercial'} onClick={() => handleRadioSelect('moveType', 'Commercial')} />
                </div>
              </div>

              <GeoAddressInput
                label="Current Address"
                placeholder="Where are you moving FROM? Tap 📍 for your location"
                value={formData.currentAddress}
                onChange={(v) => setFormData({ ...formData, currentAddress: v })}
              />

              <GeoAddressInput
                label="Destination Address"
                placeholder="Where are you moving TO?"
                value={formData.destAddress}
                onChange={(v) => setFormData({ ...formData, destAddress: v })}
                allowGPS={false}
              />

              <div className="field">
                <label>Home / Office Size</label>
                <div className="radio-grid">
                  {['Bedsitter', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms'].map(s => (
                    <RadioCard key={s} label={s} selected={formData.homeSize === s} onClick={() => handleRadioSelect('homeSize', s)} />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleNext}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Inventory ── */}
        {step === 2 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Inventory & Add-ons</div>
            <div className="field-group">
              <div className="field">
                <label>Describe Items to be Moved</label>
                <textarea
                  rows={4}
                  placeholder="e.g. sofa, 2-door fridge, queen bed, 3 wardrobes, kitchen items…"
                  value={formData.itemsDescription}
                  onChange={(e) => setFormData({ ...formData, itemsDescription: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Add-on Services</label>
                {[
                  { key: 'packing', icon: '📦', label: 'Professional Packing', sublabel: 'We pack everything safely' },
                  { key: 'furnitureAssembly', icon: '🔧', label: 'Furniture Disassembly/Reassembly', sublabel: 'Beds, wardrobes, desks' },
                  { key: 'applianceDisconnect', icon: '🔌', label: 'Appliance Disconnection/Reconnection', sublabel: 'Washing machine, fridge, etc.' },
                  { key: 'temporaryStorage', icon: '🏪', label: 'Temporary Storage', sublabel: 'Up to 7 days secure storage' },
                ].map(({ key, icon, label, sublabel }) => (
                  <div
                    key={key}
                    onClick={() => handleCheckboxChange(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: `2px solid ${formData[key] ? '#DC2626' : '#e2e8f0'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: formData[key] ? '#fff5f5' : '#fff',
                      marginBottom: 8,
                      transition: 'all .2s',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{label}</div>
                      <div style={{ fontSize: '.78rem', color: '#64748b' }}>{sublabel}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: formData[key] ? '#DC2626' : '#f1f5f9',
                      border: `2px solid ${formData[key] ? '#DC2626' : '#cbd5e1'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14, flexShrink: 0,
                    }}>
                      {formData[key] && '✓'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleNext}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Schedule ── */}
        {step === 3 && !successData && (
          <div className="form-card">
            <div className="form-card-title">Schedule Your Move</div>
            <div className="field-group">
              <div className="field">
                <label>Moving Date <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="date"
                  min={minDate}
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Preferred Time Slot</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {[
                    { label: 'Morning', sublabel: '8am – 12pm', icon: '🌅' },
                    { label: 'Afternoon', sublabel: '12pm – 4pm', icon: '☀️' },
                    { label: 'Evening', sublabel: '4pm – 7pm', icon: '🌆' },
                    { label: 'Flexible', sublabel: 'Any time', icon: '🕐' },
                  ].map(t => (
                    <RadioCard
                      key={t.label}
                      icon={t.icon}
                      label={t.label}
                      sublabel={t.sublabel}
                      selected={formData.preferredTime === t.label}
                      onClick={() => handleRadioSelect('preferredTime', t.label)}
                    />
                  ))}
                </div>
              </div>

              {/* Summary card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 18px',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '.9rem', color: '#1e293b' }}>📋 Move Summary</div>
                {[
                  ['From', formData.currentAddress || '—'],
                  ['To', formData.destAddress || '—'],
                  ['Type', `${formData.moveType} · ${formData.homeSize}`],
                  ['Items', formData.itemsDescription || '—'],
                  ['Date', formData.scheduledDate || '—'],
                  ['Time', formData.preferredTime],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: '.82rem' }}>
                    <span style={{ color: '#64748b', minWidth: 50 }}>{l}:</span>
                    <span style={{ color: '#1e293b', wordBreak: 'break-word' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Confirm Move Request →'}
              </button>
            </div>
          </div>
        )}

        {successData && (
          <SuccessCard
            icon="🏠"
            title="Relocation Request Submitted!"
            message={`Your ${formData.moveType.toLowerCase()} move from ${formData.currentAddress} to ${formData.destAddress} on ${formData.scheduledDate} has been received. Estimated cost: KES ${successData.price?.toLocaleString() || '—'}. Our team will confirm shortly.`}
            trackingCode={successData._id}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Relocation;