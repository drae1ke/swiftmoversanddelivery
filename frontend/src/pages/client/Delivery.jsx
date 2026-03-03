import React, { useState } from 'react';
import { createOrder } from '../../api';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';

const Delivery = ({ isActive, onShowPage }) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    recipientName: '',
    recipientPhone: '',
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
              <div className="field">
                <label>Pickup Address</label>
                <input
                  type="text"
                  placeholder="Full pickup address"
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Dropoff Address</label>
                <input
                  type="text"
                  placeholder="Full delivery address"
                  value={formData.dropoffAddress}
                  onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                />
              </div>
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
                <label>Package Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  min="0.1"
                  value={formData.packageWeightKg}
                  onChange={(e) => setFormData({ ...formData, packageWeightKg: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Vehicle Type</label>
                <div className="radio-grid">
                  <RadioCard
                    icon="🚲"
                    label="Bicycle"
                    sublabel="Up to 5kg"
                    selected={formData.vehicleType === 'bicycle'}
                    onClick={() => setFormData({ ...formData, vehicleType: 'bicycle' })}
                  />
                  <RadioCard
                    icon="🏍️"
                    label="Motorbike"
                    sublabel="Up to 20kg"
                    selected={formData.vehicleType === 'bike'}
                    onClick={() => setFormData({ ...formData, vehicleType: 'bike' })}
                  />
                  <RadioCard
                    icon="🚗"
                    label="Car"
                    sublabel="Up to 50kg"
                    selected={formData.vehicleType === 'car'}
                    onClick={() => setFormData({ ...formData, vehicleType: 'car' })}
                  />
                  <RadioCard
                    icon="🚐"
                    label="Van"
                    sublabel="Up to 200kg"
                    selected={formData.vehicleType === 'van'}
                    onClick={() => setFormData({ ...formData, vehicleType: 'van' })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Service Type</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <RadioCard
                    label="Standard"
                    sublabel="24–48 hrs"
                    selected={formData.serviceType === 'Standard'}
                    onClick={() => setFormData({ ...formData, serviceType: 'Standard' })}
                  />
                  <RadioCard
                    label="Same Day"
                    sublabel="+30%"
                    selected={formData.serviceType === 'Same Day'}
                    onClick={() => setFormData({ ...formData, serviceType: 'Same Day' })}
                  />
                  <RadioCard
                    label="Express"
                    sublabel="+50%"
                    selected={formData.serviceType === 'Express'}
                    onClick={() => setFormData({ ...formData, serviceType: 'Express' })}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Sending...' : 'Request Delivery →'}
              </button>
            </div>
          </div>
        ) : (
          <SuccessCard
            icon="📦"
            title="Delivery Order Created!"
            message={`Your delivery from "${successData.pickupAddress}" to "${successData.dropoffAddress}" has been placed. Estimated cost: KES ${successData.priceKes?.toLocaleString() || '—'}. A driver will be assigned shortly.`}
            trackingCode={successData._id}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default Delivery;
