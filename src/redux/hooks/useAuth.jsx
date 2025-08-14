import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, logoutUser, checkAuthStatus, clearError } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // console.log('useAuth hook - auth state:', auth); // Commented out to improve performance

  const login = useCallback(async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    return result;
  }, [dispatch]);

  const logout = useCallback(async () => {
    const result = await dispatch(logoutUser());
    return result;
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    const result = await dispatch(checkAuthStatus());
    return result;
  }, [dispatch]);

  const clearErrorCallback = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
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
    clearError: clearErrorCallback,
  };
};
