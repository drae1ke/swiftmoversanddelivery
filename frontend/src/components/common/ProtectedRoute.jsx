import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken, getUserRole } from '../../api';

/**
 * ProtectedRoute component - Protects routes based on authentication and optional role restrictions
 * @param {React.Component} Component - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles that are allowed to access this route (optional)
 * @param {string} redirectTo - Path to redirect to if not authorized (default: '/Login')
 */
const ProtectedRoute = ({ Component, allowedRoles, redirectTo = '/Login' }) => {
  const token = getAuthToken();
  const userRole = getUserRole();

  // Not authenticated - redirect to login
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authenticated but no roles specified - allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Component />;
  }

  // Check if user role is in allowed roles
  if (!userRole || !allowedRoles.includes(userRole)) {
    // User is authenticated but doesn't have the required role
    // Redirect based on their actual role
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'driver') {
      return <Navigate to="/DriverDashboard" replace />;
    } else if (userRole === 'landlord') {
      return <Navigate to="/LandlordDashboard" replace />;
    } else if (userRole === 'client') {
      return <Navigate to="/Client" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role - allow access
  return <Component />;
};

export default ProtectedRoute;
