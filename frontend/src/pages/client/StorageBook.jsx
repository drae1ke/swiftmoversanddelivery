import React, { useState, useEffect } from 'react';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';
import { bookProperty } from '../../api';
import { FaMapMarkerAlt, FaRulerCombined, FaWarehouse } from 'react-icons/fa';

const STORAGE_TYPE_LABELS = {
  room: 'Room', garage: 'Garage', warehouse: 'Warehouse',
  container: 'Container', basement: 'Basement', attic: 'Attic', other: 'Storage',
};

const StorageBook = ({ isActive, onShowPage }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    duration: '1 Month',
    access: 'Weekdays only',
    notes: '',
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedProperty');
    if (stored) {
      try {
        setSelectedProperty(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing selected property', e);
      }
    }
  }, [isActive]);

  const handleConfirmBooking = async () => {
    if (!selectedProperty || !bookingData.startDate) {
      setError('Please select a start date');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await bookProperty(selectedProperty.id, {
        startDate: bookingData.startDate,
        duration: bookingData.duration,
        accessType: bookingData.access,
        notes: bookingData.notes,
      });
      setBookingId(response.bookingRef || response._id || 'ST-' + Date.now());
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to book property');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToServices = () => {
    setShowSuccess(false);
    setBookingData({ startDate: '', duration: '1 Month', access: 'Weekdays only', notes: '' });
    sessionStorage.removeItem('selectedProperty');
    onShowPage('services');
  };

  const handleBackToStorage = () => {
    sessionStorage.removeItem('selectedProperty');
    onShowPage('storage');
  };

  const handleRadioSelect = (field, value) => setBookingData({ ...bookingData, [field]: value });

  if (!isActive) return null;

  const prop = selectedProperty;
  const typeLabel = prop ? (STORAGE_TYPE_LABELS[prop.storageType] || prop.storageType || 'Storage') : 'Storage Unit';

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-storage-book">
      <div className="page-header">
        <div className="page-tag">Storage Booking</div>
        <h1 className="page-title">Book <span>{prop?.title || 'Storage Unit'}</span></h1>
        <p className="page-desc">Complete your booking. Your unit will be reserved for 24 hours pending payment.</p>
      </div>

      <div className="form-shell">
        {!showSuccess && (
          <div className="form-card">
            {/* Property summary */}
            {prop && (
              <div className="booking-prop-summary">
                <div className="booking-prop-header">
                  <div className="booking-prop-title">{prop.title}</div>
                  <div className="booking-prop-type">{typeLabel}</div>
                </div>
                <div className="booking-prop-details">
                  <span className="booking-prop-detail">
                    <FaMapMarkerAlt size={11} />
                    {prop.address}
                  </span>
                  {prop.sizeSqFt && (
                    <span className="booking-prop-detail">
                      <FaRulerCombined size={11} />
                      {prop.sizeSqFt.toLocaleString()} sq ft
                    </span>
                  )}
                  {prop.pricePerMonth && (
                    <span className="booking-prop-detail booking-prop-price">
                      KES {Number(prop.pricePerMonth).toLocaleString()} / month
                    </span>
                  )}
                </div>
                {prop.amenities && prop.amenities.length > 0 && (
                  <div className="booking-amenities">
                    {prop.amenities.slice(0, 5).map(a => (
                      <span key={a} className="storage-tag">
                        {a.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-card-title">Booking Details</div>

            {error && (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div className="field-group">
              <div className="field-row">
                <div className="field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={e => setBookingData({ ...bookingData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="field">
                  <label>Duration</label>
                  <select
                    value={bookingData.duration}
                    onChange={e => setBookingData({ ...bookingData, duration: e.target.value })}
                  >
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>12 Months</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Access Requirements</label>
                <div className="radio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <RadioCard
                    label="Weekdays only"
                    selected={bookingData.access === 'Weekdays only'}
                    onClick={() => handleRadioSelect('access', 'Weekdays only')}
                  />
                  <RadioCard
                    label="24/7 Access"
                    selected={bookingData.access === '24/7 Access'}
                    onClick={() => handleRadioSelect('access', '24/7 Access')}
                  />
                </div>
              </div>
              <div className="field">
                <label>Special Notes</label>
                <textarea
                  placeholder="Large items, loading equipment needed, access hours…"
                  value={bookingData.notes}
                  onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBackToStorage}>
                Back to Listings
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {showSuccess && (
          <SuccessCard
            icon={null}
            title="Storage Booked!"
            message="Your unit is reserved. You will receive access credentials and a confirmation via SMS within 30 minutes."
            trackingCode={bookingId}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default StorageBook;