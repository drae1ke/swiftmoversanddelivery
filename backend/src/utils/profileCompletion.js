/**
 * Check if user profile is complete based on role
 * Returns { isComplete: boolean, missingFields: string[] }
 */
function checkProfileCompletion(user, additionalData = {}) {
  const missingFields = [];

  // Common fields for all users
  if (!user.phone || user.phone.trim() === '') {
    missingFields.push('Phone Number');
  }

  if (!user.address || !user.address.city || !user.address.county) {
    missingFields.push('Address');
  }

  // Role-specific requirements
  if (user.role === 'driver') {
    if (additionalData.driver) {
      const driver = additionalData.driver;
      if (!driver.vehicleType || driver.vehicleType === '') {
        missingFields.push('Vehicle Type');
      }
      if (!driver.plateNumber || driver.plateNumber.trim() === '') {
        missingFields.push('Plate Number');
      }
    }
    if (!user.licenseNumber || user.licenseNumber.trim() === '') {
      missingFields.push('Driver License Number');
    }
    if (!user.idNumber || user.idNumber.trim() === '') {
      missingFields.push('ID Number');
    }
  }

  if (user.role === 'landlord') {
    if (!user.idNumber || user.idNumber.trim() === '') {
      missingFields.push('ID Number');
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Get formatted list of missing fields for display
 */
function getMissingFieldsMessage(missingFields) {
  if (missingFields.length === 0) return '';
  
  if (missingFields.length === 1) {
    return `Please complete your ${missingFields[0]}`;
  }
  
  return `Please complete: ${missingFields.join(', ')}`;
}

module.exports = {
  checkProfileCompletion,
  getMissingFieldsMessage,
};
