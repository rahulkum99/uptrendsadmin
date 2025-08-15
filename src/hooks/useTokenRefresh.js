import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import { isTokenExpired, getTokenExpiration } from '../utils/api';
import { scheduleIdleTask } from '../utils/performance';

export const useTokenRefresh = () => {
  const { refreshToken, access_token } = useAuth();
  const refreshTimeoutRef = useRef(null);
  const hourlyRefreshRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  // Optimized refresh function that prevents blocking and infinite loops
  const performRefresh = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('Token refresh already in progress, skipping...');
      return;
    }

    // Prevent refreshing too frequently (minimum 30 seconds between refreshes)
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 30000) {
      console.log('Token refresh too recent, skipping...');
      return;
    }

    try {
      isRefreshingRef.current = true;
      lastRefreshTimeRef.current = now;

      scheduleIdleTask(async () => {
        console.log('Performing token refresh...');
        await refreshToken();
        console.log('Token refresh completed');
      }, 1000);
    } catch (error) {
      console.error('Token refresh error:', error);
    } finally {
      // Reset the flag after a delay to prevent immediate re-triggering
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 5000);
    }
  }, [refreshToken]);

  useEffect(() => {
    const setupTokenRefresh = () => {
      if (!access_token) {
        console.log('No access token, skipping token refresh setup');
        return;
      }

      // Clear existing timeouts
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (hourlyRefreshRef.current) {
        clearTimeout(hourlyRefreshRef.current);
        hourlyRefreshRef.current = null;
      }

      // Check if token is expired
      if (isTokenExpired(access_token)) {
        console.log('Token is expired, refreshing immediately');
        performRefresh();
        return;
      }

      // Get token expiration time
      const expirationTime = getTokenExpiration(access_token);
      if (!expirationTime) {
        console.log('Could not determine token expiration, skipping refresh setup');
        return;
      }

      // Calculate time until 30 minutes before expiration (less aggressive)
      const currentTime = Date.now();
      const timeUntilRefresh = expirationTime - currentTime - (30 * 60 * 1000); // 30 minutes before

      if (timeUntilRefresh > 0) {
        console.log(`Setting up token refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
        refreshTimeoutRef.current = setTimeout(() => {
          console.log('Refreshing token before expiration');
          performRefresh();
        }, timeUntilRefresh);
      } else {
        // Token expires in less than 30 minutes, refresh immediately
        console.log('Token expires soon (less than 30 minutes), refreshing immediately');
        performRefresh();
      }

      // Setup 2-hourly refresh as a fallback (every 2 hours)
      console.log('Setting up 2-hourly token refresh');
      hourlyRefreshRef.current = setTimeout(() => {
        console.log('2-hourly token refresh triggered');
        performRefresh();
      }, 2 * 60 * 60 * 1000); // 2 hours
    };

    setupTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (hourlyRefreshRef.current) {
        clearTimeout(hourlyRefreshRef.current);
        hourlyRefreshRef.current = null;
      }
    };
  }, [access_token, performRefresh]);

  return null;
};
