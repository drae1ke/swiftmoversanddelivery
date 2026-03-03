import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ProfileCompletionBanner.css';

const ProfileCompletionBanner = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    if (user) {
      const missing = checkProfileCompletion(user);
      setMissingFields(missing);
      setShow(missing.length > 0);
    }
  }, [user]);

  const checkProfileCompletion = (user) => {
    const missing = [];

    // Common fields for all users
    if (!user.phone || user.phone.trim() === '') {
      missing.push('Phone Number');
    }

    if (!user.address || !user.address.city || !user.address.county) {
      missing.push('Address (City & County)');
    }

    // Role-specific requirements
    if (user.role === 'driver') {
      if (!user.licenseNumber || user.licenseNumber.trim() === '') {
        missing.push('Driver License Number');
      }
      if (!user.idNumber || user.idNumber.trim() === '') {
        missing.push('ID Number');
      }
    }

    if (user.role === 'landlord') {
      if (!user.idNumber || user.idNumber.trim() === '') {
        missing.push('ID Number');
      }
    }

    return missing;
  };

  const handleDismiss = () => {
    setShow(false);
    // Store dismissal in localStorage to not show again for this session
    localStorage.setItem('profileBannerDismissed', 'true');
  };

  const handleNavigateToProfile = () => {
    // Navigate to profile page based on role
    const profilePaths = {
      client: '/Client',
      driver: '/DriverDashboard',
      admin: '/admin',
      landlord: '/LandlordDashboard',
    };
    
    window.location.href = profilePaths[user?.role] || '/';
  };

  // Don't show if user dismissed it this session
  if (localStorage.getItem('profileBannerDismissed') === 'true') {
    return null;
  }

  if (!show || missingFields.length === 0) {
    return null;
  }

  return (
    <div className="profile-completion-banner">
      <div className="banner-content">
        <div className="banner-icon">
          <FaExclamationTriangle />
        </div>
        <div className="banner-text">
          <h4>Complete Your Profile</h4>
          <p>
            Please complete the following fields to enjoy full platform benefits:{' '}
            <strong>{missingFields.join(', ')}</strong>
          </p>
        </div>
        <div className="banner-actions">
          <button className="banner-btn banner-btn-primary" onClick={handleNavigateToProfile}>
            Complete Profile
          </button>
          <button className="banner-btn banner-btn-dismiss" onClick={handleDismiss}>
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
