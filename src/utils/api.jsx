import config from '../config/config.jsx';
import { refreshToken } from '../redux/slices/authSlice';
import { redirectToLogin } from './history';

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${config.API_BASE_URL}auth/admin-login/`,
  REFRESH_TOKEN: `${config.API_BASE_URL}auth/token/refresh/`,
  PROFILE: `${config.API_BASE_URL}auth/profile/`,
};

// Helper function to make API calls with automatic token refresh
export const apiCall = async (endpoint, options = {}, store = null) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('access_token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && store) {
    try {
      console.log('Token expired, attempting refresh...');
      const refreshResult = await store.dispatch(refreshToken());
      
      if (refreshResult.meta.requestStatus === 'fulfilled') {
        // Retry the original request with new token
        const newToken = localStorage.getItem('access_token');
        if (newToken) {
          defaultOptions.headers['Authorization'] = `Bearer ${newToken}`;
          
          const retryResponse = await fetch(endpoint, {
            ...defaultOptions,
            ...options,
          });

          const retryData = await retryResponse.json();

          if (!retryResponse.ok) {
            throw new Error(retryData.detail || 'API request failed after token refresh');
          }

          return retryData;
        }
             } else {
         // Refresh failed, redirect to login
         console.log('Token refresh failed, redirecting to login');
         redirectToLogin();
         return;
       }
     } catch (error) {
       console.error('Token refresh error:', error);
       redirectToLogin();
       return;
     }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'API request failed');
  }

  return data;
};

// Utility function to check if JWT token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Utility function to get token expiration time
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};
