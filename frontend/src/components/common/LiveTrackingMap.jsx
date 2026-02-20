import React, { useState, useEffect } from 'react';
import '../../styles/LiveTrackingMap.css';

const LiveTrackingMap = ({ orderId }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching order details
    const fetchOrderDetails = async () => {
      // Replace with actual API call
      const mockDetails = {
        orderId: orderId,
        driverName: 'John Kamau',
        vehicleNumber: 'KCA 123X',
        estimatedArrival: '15 minutes',
        status: 'In Transit'
      };
      
      setOrderDetails(mockDetails);
      
      // Simulate driver location (Nairobi coordinates)
      setDriverLocation({ lat: -1.286389, lng: 36.817223 });
      setIsLoading(false);
    };

    fetchOrderDetails();

    // Simulate real-time location updates
    const locationInterval = setInterval(() => {
      setDriverLocation(prev => {
        if (!prev) return { lat: -1.286389, lng: 36.817223 };
        return {
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        };
      });
    }, 5000);

    return () => clearInterval(locationInterval);
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="tracking-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading tracking information...</p>
      </div>
    );
  }

  return (
    <div className="live-tracking-container">
      <div className="tracking-header">
        <h2 className="tracking-title">
          <i className="fas fa-map-marked-alt"></i>
          Live Tracking
        </h2>
        <span className="tracking-status">
          <i className="fas fa-circle status-pulse"></i>
          {orderDetails?.status}
        </span>
      </div>

      {/* Driver Info Card */}
      <div className="driver-info-card">
        <div className="driver-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="driver-details">
          <h3 className="driver-name">{orderDetails?.driverName}</h3>
          <p className="vehicle-number">
            <i className="fas fa-car"></i> {orderDetails?.vehicleNumber}
          </p>
        </div>
        <div className="eta-info">
          <span className="eta-label">ETA</span>
          <span className="eta-time">{orderDetails?.estimatedArrival}</span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-marker">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <p className="map-info">
            {driverLocation ? (
              <>
                Lat: {driverLocation.lat.toFixed(6)}, 
                Lng: {driverLocation.lng.toFixed(6)}
              </>
            ) : (
              'Waiting for location...'
            )}
          </p>
          <div className="truck-icon-container">
            <i className="fas fa-truck truck-icon"></i>
          </div>
        </div>
        <p className="map-note">
          <i className="fas fa-info-circle"></i>
          Replace this with Google Maps component using your API key
        </p>
      </div>

      {/* Action Buttons */}
      <div className="tracking-actions">
        <button className="action-button primary">
          <i className="fas fa-phone"></i>
          Call Driver
        </button>
        <button className="action-button secondary">
          <i className="fas fa-comment"></i>
          Message
        </button>
        <button className="action-button secondary">
          <i className="fas fa-share-alt"></i>
          Share Location
        </button>
      </div>
    </div>
  );
};

export default LiveTrackingMap;