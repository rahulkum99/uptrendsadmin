/**
 * RTK Query API slice for profile management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/config';
import authService from '../../services/authService';

// Base query with automatic token handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${config.API_BASE_URL}auth/`,
  prepareHeaders: (headers) => {
    // Get token from authService
    const token = authService.getAccessToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    console.log('Token expired, attempting refresh...');
    
    try {
      // Use authService to refresh token
      const newAccessToken = await authService.refreshAccessToken();
      
      if (newAccessToken) {
        // Retry the original request
        result = await baseQueryWithAuth(args, api, extraOptions);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // Only logout if refresh actually fails
      authService.logout();
      return result;
    }
  }

  return result;
};

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    // Get profile data
    getProfile: builder.query({
      query: () => 'profile/',
      providesTags: ['Profile'],
      transformResponse: (response) => {
        console.log('Profile API response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Profile API error:', response);
        return response;
      },
    }),

    // Update profile data
    updateProfile: builder.mutation({
      query: (data) => {
        // Handle both FormData and JSON data
        const isFormData = data instanceof FormData;
        
        return {
          url: 'profile/',
          method: 'PUT',
          body: data,
          // Don't set Content-Type for FormData, let browser handle it
          headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['Profile'],
      transformResponse: (response) => {
        console.log('Profile update response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Profile update error:', response);
        return response;
      },
    }),

    // Create profile (if needed)
    createProfile: builder.mutation({
      query: (data) => {
        const isFormData = data instanceof FormData;
        
        return {
          url: 'profile/',
          method: 'POST',
          body: data,
          headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['Profile'],
      transformResponse: (response) => {
        console.log('Profile create response:', response);
        return response;
      },
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateProfileMutation,
} = profileApi;

export default profileApi;
