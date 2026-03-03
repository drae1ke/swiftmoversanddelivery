import React, { useState, useEffect } from 'react';
import RadioCard from '../../components/client/RadioCard';
import SuccessCard from '../../components/client/SucccessCard';
import { bookProperty } from '../../api';

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
    notes: ''
  });

  // Get selected property from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedProperty');
    if (stored) {
      setSelectedProperty(JSON.parse(stored));
    }
  }, [isActive]);

  const handleConfirmBooking = async () => {
    if (!selectedProperty || !bookingData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await bookProperty(selectedProperty.id, {
        startDate: bookingData.startDate,
        duration: bookingData.duration,
        accessType: bookingData.access,
        notes: bookingData.notes
      });

      setBookingId(response._id || 'ST-' + Date.now());
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to book property');
      console.error('Booking error:', err);
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

  const handleRadioSelect = (field, value) => {
    setBookingData({ ...bookingData, [field]: value });
  };

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-storage-book">
      <div className="page-header">
        <div className="page-tag">Storage Booking</div>
        <h1 className="page-title">Book <span id="booking-name">{selectedProperty?.name || 'Storage Unit'}</span></h1>
        <p className="page-desc">Complete your booking. Your unit will be reserved for 24 hours pending payment.</p>
      </div>

      <div className="form-shell">
        {!showSuccess && (
          <div className="form-card">
            <div className="form-card-title">Booking Details</div>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}
            
            <div className="field-group">
              <div className="field-row">
                <div className="field">
                  <label>Start Date</label>
                  <input 
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                  />
                </div>
                <div className="field">
                  <label>Duration</label>
                  <select 
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
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
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                ></textarea>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleBackToStorage}>
                ← Back to List
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking →'}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {showSuccess && (
          <SuccessCard
            icon="🏢"
            title="Storage Booked!"
            message="Your unit is reserved. You'll receive access credentials and a welcome kit via SMS within 30 minutes."
            trackingCode={bookingId}
            onBack={handleBackToServices}
          />
        )}
      </div>
    </div>
  );
};

export default StorageBook;