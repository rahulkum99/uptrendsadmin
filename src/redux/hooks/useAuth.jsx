/**
 * DEPRECATED: This Redux-based useAuth hook is deprecated
 * Use the new Context-based useAuth hook instead:
 * 
 * Old: import { useAuth } from './redux/hooks/useAuth';
 * New: import { useAuth } from './hooks/useAuth';
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  loginUser,
  logoutUser,
  checkAuthStatus,
  refreshToken,
  clearError
} from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  /** Login */
  const login = useCallback(async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return result; // actual data, not action object
    } catch (err) {
      return Promise.reject(err);
    }
  }, [dispatch]);

  /** Logout */
  const logout = useCallback(async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }, [dispatch]);

  /** Check Authentication Status */
  const checkAuth = useCallback(async () => {
    try {
      const result = await dispatch(checkAuthStatus()).unwrap();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }, [dispatch]);

  /** Refresh Token */
  const refreshTokenCallback = useCallback(async () => {
    try {
      const result = await dispatch(refreshToken()).unwrap();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }, [dispatch]);

  /** Clear error */
  const clearErrorCallback = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Note: Auto refresh is now handled by useTokenRefresh hook
  // This prevents conflicting refresh mechanisms

  /** Return stable object reference */
  return useMemo(() => ({
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    is_verified: auth.is_verified,
    access_token: auth.access_token,
    refresh_token: auth.refresh_token,

    // Actions
    login,
    logout,
    checkAuth,
    refreshToken: refreshTokenCallback,
    clearError: clearErrorCallback,
  }), [
    auth.user,
    auth.isAuthenticated,
    auth.isLoading,
    auth.error,
    auth.is_verified,
    auth.access_token,
    auth.refresh_token,
    login,
    logout,
    checkAuth,
    refreshTokenCallback,
    clearErrorCallback
  ]);
};
