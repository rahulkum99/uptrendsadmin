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

  /** Auto refresh token every 15 minutes if logged in */
  useEffect(() => {
    if (auth.access_token && auth.refresh_token) {
      const interval = setInterval(() => {
        dispatch(refreshToken());
      }, 15 * 60 * 1000); // every 15 min

      return () => clearInterval(interval);
    }
  }, [auth.access_token, auth.refresh_token, dispatch]);

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
