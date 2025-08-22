/**
 * Simple Auth Context using the centralized auth service
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import config from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        // If authenticated, fetch user profile
        if (isAuth) {
          fetchUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
              const profileData = await authService.apiCall(`${config.API_BASE_URL}auth/profile/`);
      setUser(profileData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't set error here as it's not critical
    }
  };

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(credentials);
      setUser(userData.user || userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setIsLoading(true);
    try {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Make authenticated API call
  const apiCall = async (url, options = {}) => {
    try {
      return await authService.apiCall(url, options);
    } catch (error) {
      if (error.message === 'Authentication failed') {
        // Auth service already handled logout
        setUser(null);
        setIsAuthenticated(false);
      }
      throw error;
    }
  };

  // Get current tokens (for debugging)
  const getTokens = () => {
    return authService.getTokens();
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    clearError,
    apiCall,
    getTokens,
    
    // Utilities
    refreshUserProfile: fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
