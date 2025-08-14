import config from '../config/config.jsx';

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${config.API_BASE_URL}auth/admin-login/`,
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'API request failed');
  }

  return data;
};
