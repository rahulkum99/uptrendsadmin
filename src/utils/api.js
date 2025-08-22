/**
 * Simple API utilities - Deprecated
 * Use authService.apiCall() for authenticated requests instead
 */

import config from '../config/config.jsx';
import authService from '../services/authService';

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${config.API_BASE_URL}auth/admin-login/`,
  REFRESH_TOKEN: `${config.API_BASE_URL}auth/token/refresh/`,
  PROFILE: `${config.API_BASE_URL}auth/profile/`,
};

// Deprecated: Use authService.apiCall() instead
export const apiCall = async (endpoint, options = {}) => {
  console.warn('apiCall is deprecated. Use authService.apiCall() instead.');
  return authService.apiCall(endpoint, options);
};

// Deprecated: Use authService.isTokenExpired() instead
export const isTokenExpired = (token) => {
  console.warn('isTokenExpired is deprecated. Use authService.isTokenExpired() instead.');
  return authService.isTokenExpired(token);
};

// Deprecated: Use authService.getTimeUntilExpiry() instead
export const getTokenExpiration = (token) => {
  console.warn('getTokenExpiration is deprecated. Use authService.getTimeUntilExpiry() instead.');
  return authService.getTimeUntilExpiry(token) * 1000; // Convert to milliseconds for backward compatibility
};
