import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../utils/api.jsx';
import config from '../../config/config.jsx';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
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
    } catch {
      return rejectWithValue({ detail: 'Network error occurred' });
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

// Check if user is already logged in on app start
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem(config.TOKEN_KEY);
      const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);
      
      console.log('Checking auth status - accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);
      
      if (accessToken && refreshToken) {
        // You can add token validation here if needed
        return { access_token: accessToken, refresh_token: refreshToken };
      }
      
      return rejectWithValue({ detail: 'No tokens found' });
    } catch {
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
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        // console.log('Auth check rejected'); // Commented out for performance
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
