import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import { isTokenExpired, getTokenExpiration } from '../utils/api';
import { scheduleIdleTask } from '../utils/performance';

export const useTokenRefresh = () => {
  const { refreshToken, access_token } = useAuth();
  const refreshTimeoutRef = useRef(null);
  const hourlyRefreshRef = useRef(null);

  // Optimized refresh function that prevents blocking
  const performRefresh = useCallback(async () => {
    try {
      scheduleIdleTask(async () => {
        try {
          console.log('Performing token refresh...');
          await refreshToken();
        } catch (error) {
          // Silently ignore benign refresh cases
          if (
            error?.detail === 'Token still valid' ||
            error?.detail === 'Token refresh already in progress'
          ) {
            return;
          }
          console.error('Token refresh error (caught):', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, [refreshToken]);

  useEffect(() => {
    const setupTokenRefresh = () => {
      if (!access_token) return;

      // Clear existing timeouts
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (hourlyRefreshRef.current) {
        clearTimeout(hourlyRefreshRef.current);
      }

      // Check if token is expired
      if (isTokenExpired(access_token)) {
        console.log('Token is expired, refreshing immediately');
        performRefresh();
        return;
      }

      // Get token expiration time
      const expirationTime = getTokenExpiration(access_token);
      if (!expirationTime) return;

      // Calculate time until 1 hour before expiration (or immediately if less than 1 hour left)
      const currentTime = Date.now();
      const timeUntilRefresh = expirationTime - currentTime - (60 * 60 * 1000); // 1 hour before

      if (timeUntilRefresh > 0) {
        console.log(`Setting up token refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
        refreshTimeoutRef.current = setTimeout(() => {
          console.log('Refreshing token before expiration');
          performRefresh();
        }, timeUntilRefresh);
      } else {
        // Token expires in less than 1 hour, refresh immediately
        console.log('Token expires soon (less than 1 hour), refreshing immediately');
        performRefresh();
      }

      // Setup hourly refresh as a fallback (every 1 hour)
      console.log('Setting up hourly token refresh');
      hourlyRefreshRef.current = setTimeout(() => {
        console.log('Hourly token refresh triggered');
        performRefresh();
      }, 60 * 60 * 1000); // 1 hour
    };

    setupTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (hourlyRefreshRef.current) {
        clearTimeout(hourlyRefreshRef.current);
      }
    };
  }, [access_token, performRefresh]);

  return null;
};
