/**
 * Simple Auth Slice - Deprecated in favor of AuthContext
 * Kept for backward compatibility only
 * 
 * Note: New code should use AuthContext instead of this Redux slice
 */

import { createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { setLoading, setUser, setError, clearError, logout } = authSlice.actions;

// Async action creators (thunks)
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const userData = await authService.login(credentials);
    dispatch(setUser(userData.user || userData));
    return userData;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const logoutUser = () => (dispatch) => {
  authService.logout();
  dispatch(logout());
};

export default authSlice.reducer;
