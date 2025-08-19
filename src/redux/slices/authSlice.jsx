import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../utils/api.jsx';
import config from '../../config/config.jsx';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Use real API
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      // Store tokens in localStorage
      localStorage.setItem(config.TOKEN_KEY, data.access_token);
      localStorage.setItem(config.REFRESH_TOKEN_KEY, data.refresh_token);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue({ detail: 'Network error occurred. Please check your connection.' });
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Clear tokens from localStorage
      localStorage.removeItem(config.TOKEN_KEY);
      localStorage.removeItem(config.REFRESH_TOKEN_KEY);
      return true;
    } catch {
      return rejectWithValue({ detail: 'Logout failed' });
    }
  }
);

// Refresh token thunk
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const refreshTokenValue = state.auth.refresh_token;
      
      if (!refreshTokenValue) {
        return rejectWithValue({ detail: 'No refresh token available' });
      }

      // Check if we're already refreshing to prevent multiple simultaneous calls
      if (state.auth.isRefreshing) {
        console.log('Already refreshing token, skipping...');
        return rejectWithValue({ detail: 'Token refresh already in progress' });
      }

      // Check if current token is still valid (has more than 30 minutes left)
      const currentToken = state.auth.access_token;
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = payload.exp - currentTime;
          
          // If token has more than 30 minutes left, don't refresh
          if (timeUntilExpiry > 30 * 60) {
            console.log(`Token still valid for ${Math.round(timeUntilExpiry / 60)} minutes, skipping refresh`);
            return rejectWithValue({ detail: 'Token still valid' });
          }
        } catch (error) {
          console.log('Could not parse current token, proceeding with refresh');
        }
      }

      // Call refresh endpoint
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshTokenValue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      // Update localStorage with new access token
      localStorage.setItem(config.TOKEN_KEY, data.access);

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      return rejectWithValue({ detail: 'Token refresh failed' });
    }
  }
);

// Check if user is already logged in on app start
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem(config.TOKEN_KEY);
      const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);
      
      console.log('Checking auth status - accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);
      
      if (accessToken && refreshToken) {
        // Validate tokens with server if needed
        return { access_token: accessToken, refresh_token: refreshToken };
      }
      
      return rejectWithValue({ detail: 'No tokens found' });
    } catch (error) {
      console.error('Auth check error:', error);
      return rejectWithValue({ detail: 'Auth check failed' });
    }
  }
);

const initialState = {
  user: null,
  access_token: localStorage.getItem(config.TOKEN_KEY) || null,
  refresh_token: localStorage.getItem(config.REFRESH_TOKEN_KEY) || null,
  isAuthenticated: !!localStorage.getItem(config.TOKEN_KEY),
  isLoading: false,
  isRefreshing: false,
  error: null,
  is_verified: false,
};

// console.log('Auth slice initial state:', initialState); // Commented out to improve performance

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
        state.is_verified = action.payload.is_verified;
        state.error = null;
        // Redirect to dashboard after successful login
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.detail || 'Login failed';
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
        state.is_verified = false;
        state.error = null;
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.detail || 'Logout failed';
      })
      
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        // console.log('Auth check pending'); // Commented out for performance
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        // console.log('Auth check fulfilled'); // Commented out for performance
        state.isLoading = false;
        state.isAuthenticated = true;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
        // Set user data if available
        if (action.payload.user) {
          state.user = action.payload.user;
          state.is_verified = action.payload.is_verified || false;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        // console.log('Auth check rejected'); // Commented out for performance
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
      })
      
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        console.log('Token refresh pending');
        state.isRefreshing = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        console.log('Token refresh fulfilled');
        state.isRefreshing = false;
        state.access_token = action.payload.access;
        state.isAuthenticated = true;
        // Keep existing user data and refresh token
        // state.refresh_token remains unchanged
        // state.user remains unchanged
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.log('Token refresh rejected:', action.payload);
        state.isRefreshing = false;
        
        // Don't clear tokens if the reason is "Token still valid" or "already in progress"
        if (action.payload?.detail === 'Token still valid' || 
            action.payload?.detail === 'Token refresh already in progress') {
          // Keep the current state, just clear loading
          return;
        }
        
        // For other errors, clear everything
        state.isAuthenticated = false;
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
        state.error = action.payload?.detail || 'Token refresh failed';
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
