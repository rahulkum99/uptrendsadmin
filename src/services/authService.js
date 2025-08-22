/**
 * Centralized Authentication Service
 * Simple, clean, and easy to maintain
 */

import config from '../config/config.jsx';

class AuthService {
  constructor() {
    this.refreshPromise = null; // Prevent multiple simultaneous refresh calls
  }

  // Get tokens from localStorage
  getTokens() {
    return {
      accessToken: localStorage.getItem(config.TOKEN_KEY),
      refreshToken: localStorage.getItem(config.REFRESH_TOKEN_KEY)
    };
  }

  // Save tokens to localStorage
  saveTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(config.TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem(config.TOKEN_KEY);
    localStorage.removeItem(config.REFRESH_TOKEN_KEY);
  }

  // Check if access token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      // Consider token expired if it expires in less than 5 minutes
      return payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(token) {
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      return 0;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const { refreshToken } = this.getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Create refresh promise
    this.refreshPromise = this._performRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done
      this.refreshPromise = null;
    }
  }

  // Internal method to perform the actual refresh
  async _performRefresh(refreshToken) {
    try {
      const response = await fetch(`${config.API_BASE_URL}auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both possible response formats
      const newAccessToken = data.access || data.access_token;
      
      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      // Save new access token
      this.saveTokens(newAccessToken);
      
      console.log('Token refreshed successfully');
      return newAccessToken;

    } catch (error) {
      console.error('Token refresh failed:', error.message);
      
      // If refresh fails, clear all tokens
      if (error.message.includes('HTTP 401') || error.message.includes('invalid')) {
        this.clearTokens();
      }
      
      throw error;
    }
  }

  // Make authenticated API call with automatic token refresh
  async apiCall(url, options = {}) {
    const { accessToken } = this.getTokens();
    
    // If no token, throw error
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // If token is expired, refresh it first
    let currentToken = accessToken;
    if (this.isTokenExpired(currentToken)) {
      console.log('Token expired, refreshing...');
      try {
        currentToken = await this.refreshAccessToken();
      } catch (error) {
        throw new Error('Failed to refresh expired token');
      }
    }

    // Make API call with current token
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If 401, try to refresh token once and retry
    if (response.status === 401) {
      console.log('Received 401, attempting token refresh...');
      try {
        const newToken = await this.refreshAccessToken();
        
        // Retry the request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`API call failed: ${retryResponse.status}`);
        }

        return retryResponse.json();
      } catch (refreshError) {
        // If refresh fails, redirect to login
        this.clearTokens();
        window.location.href = '/';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  }

  // Login method
  async login(credentials) {
    const response = await fetch(`${config.API_BASE_URL}auth/admin-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Save tokens
    this.saveTokens(data.access_token, data.refresh_token);
    
    return data;
  }

  // Logout method
  logout() {
    this.clearTokens();
    window.location.href = '/';
  }

  // Check if user is authenticated
  isAuthenticated() {
    const { accessToken, refreshToken } = this.getTokens();
    return !!(accessToken && refreshToken);
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;
