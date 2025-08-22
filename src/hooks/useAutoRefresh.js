/**
 * Simple automatic token refresh hook
 * Refreshes token when it's about to expire
 */

import { useEffect, useRef } from 'react';
import authService from '../services/authService';

export const useAutoRefresh = () => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    const setupAutoRefresh = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only setup if user is authenticated
      if (!authService.isAuthenticated()) {
        return;
      }

      const { accessToken } = authService.getTokens();
      
      if (!accessToken) {
        return;
      }

      // Get time until token expires
      const timeUntilExpiry = authService.getTimeUntilExpiry(accessToken);
      
      // If token is already expired or expires in less than 5 minutes, refresh immediately
      if (timeUntilExpiry < 300) {
        console.log('Token expires soon, refreshing immediately...');
        authService.refreshAccessToken().catch(error => {
          console.error('Auto refresh failed:', error);
        });
        return;
      }

      // Schedule refresh 5 minutes before expiry
      const refreshTime = (timeUntilExpiry - 300) * 1000; // Convert to milliseconds
      
      console.log(`Auto refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      
      timeoutRef.current = setTimeout(() => {
        console.log('Auto refreshing token...');
        authService.refreshAccessToken()
          .then(() => {
            console.log('Auto refresh successful');
            // Setup next refresh
            setupAutoRefresh();
          })
          .catch(error => {
            console.error('Auto refresh failed:', error);
          });
      }, refreshTime);
    };

    // Setup initial refresh
    setupAutoRefresh();

    // Setup refresh when tokens change
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        setupAutoRefresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array - effect manages its own updates

  return null;
};
