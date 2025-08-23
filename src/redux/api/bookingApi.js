/**
 * RTK Query API slice for booking management
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

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking', 'BookingList'],
  endpoints: (builder) => ({
    // Get all bookings with pagination
    getBookings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add search parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.invoice_no) searchParams.append('invoice_no', params.invoice_no);
        
        // Add filter parameters
        if (params.order_status) searchParams.append('order_status', params.order_status);
        if (params.is_paid !== undefined) searchParams.append('is_paid', params.is_paid);
        if (params.amount_status) searchParams.append('amount_status', params.amount_status);
        if (params.visit_date) searchParams.append('visit_date', params.visit_date);
        
        const queryString = searchParams.toString();
        return `order-detail/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ uid }) => ({ 
                type: 'Booking', 
                id: uid 
              })),
              { type: 'BookingList', id: 'LIST' },
            ]
          : [{ type: 'BookingList', id: 'LIST' }],
      transformResponse: (response) => {
        console.log('Booking API response:', response);
        
        // Handle paginated response structure
        if (response.results) {
          // Sort bookings by creation date (newest first)
          const sortedResults = response.results.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });

          return {
            ...response,
            results: sortedResults
          };
        }
        
        // Fallback for non-paginated response (backward compatibility)
        return response.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      },
      transformErrorResponse: (response) => {
        console.error('Booking API error:', response);
        return response;
      },
    }),

    // Get single booking by UID
    getBooking: builder.query({
      query: (uid) => `order-detail/${uid}/`,
      providesTags: (result, error, uid) => [
        { type: 'Booking', id: uid }
      ],
      transformResponse: (response) => {
        console.log('Single booking API response:', response);
        return response;
      },
    }),

    // Update booking status
    updateBookingStatus: builder.mutation({
      query: ({ uid, order_status }) => ({
        url: `order-detail/${uid}/`,
        method: 'PATCH',
        body: { order_status },
      }),
      invalidatesTags: (result, error, { uid }) => [
        { type: 'Booking', id: uid },
        { type: 'BookingList', id: 'LIST' },
      ],
    }),

    // Delete booking
    deleteBooking: builder.mutation({
      query: (uid) => ({
        url: `order-detail/${uid}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, uid) => [
        { type: 'Booking', id: uid },
        { type: 'BookingList', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
} = bookingApi;

export default bookingApi;
