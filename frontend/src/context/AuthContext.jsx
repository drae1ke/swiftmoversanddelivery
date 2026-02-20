import React, { createContext, useState, useCallback, useEffect } from 'react';
import { getAuthToken, setAuthToken, getCurrentUser, setCurrentUser, getUserRole } from '../api';

/**
 * AuthContext - Provides authentication state and methods to the entire app
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    const role = getUserRole();

    if (token && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, userData) => {
    setAuthToken(token);
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setUser(userData);
    setUserRole(userData.role);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  }, []);

  const updateUserProfile = useCallback((updatedData) => {
    const updated = { ...user, ...updatedData };
    setCurrentUser(updated);
    setUser(updated);
  }, [user]);

  const hasRole = useCallback((role) => {
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }, [userRole]);

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isDriver = useCallback(() => hasRole('driver'), [hasRole]);
  const isClient = useCallback(() => hasRole('client'), [hasRole]);
  const isLandlord = useCallback(() => hasRole('landlord'), [hasRole]);

  const value = {
    isAuthenticated,
    user,
    userRole,
    loading,
    login,
    logout,
    updateUserProfile,
    hasRole,
    isAdmin,
    isDriver,
    isClient,
    isLandlord,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use AuthContext
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
