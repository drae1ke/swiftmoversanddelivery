import React, { useState } from 'react';
import { createOrder } from '../../api';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';
import GeoAddressInput from '../../components/common/GeoAddressInput';

const Delivery = ({ isActive, onShowPage }) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    packageWeightKg: '',
    vehicleType: 'bike',
    serviceType: 'Standard',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleBack = () => {
    onShowPage('services');
  };

  const handleSubmit = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress || !formData.packageWeightKg) {
      setError('Please fill in pickup address, dropoff address, and package weight.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const order = await createOrder({
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientEmail: formData.recipientEmail,
        distanceKm: 10,
        packageWeightKg: Number(formData.packageWeightKg),
        vehicleType: formData.vehicleType,
        serviceType: formData.serviceType,
      });
      setSuccessData(order);
    } catch (err) {
      setError(err.message || 'Failed to create delivery order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToServices = () => {
    setSuccessData(null);
    setFormData({
      pickupAddress: '',
      dropoffAddress: '',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      packageWeightKg: '',
      vehicleType: 'bike',
      serviceType: 'Standard',
    });
    onShowPage('services');
  };

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-delivery">
      <div className="page-header">
        <div className="page-tag">Delivery Service</div>
        <h1 className="page-title">Send a <span>Package</span></h1>
        <p className="page-desc">Same-day or standard delivery across Kenya. Fill in the details below and we'll handle the rest.</p>
      </div>

      <div className="form-shell">
        {!successData ? (
          <div className="form-card">
            <div className="form-card-title">Delivery Details</div>

            {error && (
              <div style={{ color: '#e53e3e', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div className="field-group">
              {/* Geo-coded address inputs */}
              <GeoAddressInput
                label="Pickup Address"
                placeholder="Start typing or tap 📍 for your location"
                value={formData.pickupAddress}
                onChange={(v) => setFormData({ ...formData, pickupAddress: v })}
              />
              <GeoAddressInput
                label="Dropoff Address"
                placeholder="Start typing or tap 📍 for your location"
                value={formData.dropoffAddress}
                onChange={(v) => setFormData({ ...formData, dropoffAddress: v })}
              />

              <div className="field-row">
                <div className="field">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Name of person receiving"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Recipient Phone</label>
                  <input
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label>Recipient Email (optional)</label>
                <input
                  type="email"
                  placeholder="e.g. recipient@email.com"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                />
                <span className="form-hint">
                  If provided, the recipient will receive an email with tracking and driver details when a driver accepts the order.
                </span>
              </div>

              <div className="field">
                <label>Package Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 2.5"
                  value={formData.packageWeightKg}
                  onChange={(e) => setFormData({ ...formData, packageWeightKg: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Vehicle Type</label>
                <div className="radio-grid">
                  {[
                    { value: 'bike', icon: '🏍️', label: 'Motorbike', sublabel: 'Up to 10kg' },
                    { value: 'car', icon: '🚗', label: 'Car', sublabel: 'Up to 50kg' },
                    { value: 'van', icon: '🚐', label: 'Van', sublabel: 'Up to 300kg' },
                  ].map(v => (
                    <RadioCard
                      key={v.value}
                      icon={v.icon}
                      label={v.label}
                      sublabel={v.sublabel}
                      selected={formData.vehicleType === v.value}
                      onClick={() => setFormData({ ...formData, vehicleType: v.value })}
                    />
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Service Type</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <RadioCard icon="⚡" label="Express" sublabel="Same day" selected={formData.serviceType === 'Express'} onClick={() => setFormData({ ...formData, serviceType: 'Express' })} />
                  <RadioCard icon="📦" label="Standard" sublabel="1–2 days" selected={formData.serviceType === 'Standard'} onClick={() => setFormData({ ...formData, serviceType: 'Standard' })} />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Placing Order…' : 'Place Order →'}
              </button>
            </div>
          </div>
        ) : (
          <SuccessCard
            icon="📦"
            title="Delivery Order Placed!"
            message={`Your package from ${formData.pickupAddress} to ${formData.dropoffAddress} has been booked. Estimated cost: KES ${successData.priceKes?.toLocaleString() || '—'}.`}
            trackingCode={successData._id}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Delivery;