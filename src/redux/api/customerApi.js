/**
 * RTK Query API slice for customer management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/config';
import authService from '../../services/authService';

// Base query with automatic token handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${config.API_BASE_URL}adminuser/`,
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

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Customer', 'CustomerList'],
  endpoints: (builder) => ({
    // Get all customers with pagination
    getCustomers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        // Note: Currently loads all data from first page
        // Future enhancement: implement page navigation
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add search parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.phone) searchParams.append('phone', params.phone);
        if (params.email) searchParams.append('email', params.email);
        
        // Add filter parameters
        if (params.is_active !== undefined) {
          searchParams.append('is_active', params.is_active);
        }
        if (params.gender) searchParams.append('gender', params.gender);
        
        const queryString = searchParams.toString();
        return `customer/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ user_phone_number }) => ({ 
                type: 'Customer', 
                id: user_phone_number 
              })),
              { type: 'CustomerList', id: 'LIST' },
            ]
          : [{ type: 'CustomerList', id: 'LIST' }],
      transformResponse: (response) => {
        console.log('Customer API response:', response);
        
        // Handle paginated response structure
        if (response.results) {
          // Sort customers by verification status and then by name
          const sortedResults = response.results.sort((a, b) => {
            // Verified customers first
            if (a.is_verified !== b.is_verified) {
              return b.is_verified - a.is_verified;
            }
            // Then sort by name
            const nameA = `${a.first_name} ${a.last_name}`.trim() || a.user_phone_number;
            const nameB = `${b.first_name} ${b.last_name}`.trim() || b.user_phone_number;
            return nameA.localeCompare(nameB);
          });

          return {
            ...response,
            results: sortedResults
          };
        }
        
        // Fallback for non-paginated response (backward compatibility)
        return response.sort((a, b) => {
          if (a.is_verified !== b.is_verified) {
            return b.is_verified - a.is_verified;
          }
          const nameA = `${a.first_name} ${a.last_name}`.trim() || a.user_phone_number;
          const nameB = `${b.first_name} ${b.last_name}`.trim() || b.user_phone_number;
          return nameA.localeCompare(nameB);
        });
      },
      transformErrorResponse: (response) => {
        console.error('Customer API error:', response);
        return response;
      },
    }),

    // Get single customer by phone number
    getCustomer: builder.query({
      query: (phoneNumber) => `customer/${phoneNumber}/`,
      providesTags: (result, error, phoneNumber) => [
        { type: 'Customer', id: phoneNumber }
      ],
      transformResponse: (response) => {
        console.log('Single customer API response:', response);
        return response;
      },
    }),

    // Delete customer
    deleteCustomer: builder.mutation({
      query: (phoneNumber) => ({
        url: `customer/${phoneNumber}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, phoneNumber) => [
        { type: 'Customer', id: phoneNumber },
        { type: 'CustomerList', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useDeleteCustomerMutation,
} = customerApi;

export default customerApi;
