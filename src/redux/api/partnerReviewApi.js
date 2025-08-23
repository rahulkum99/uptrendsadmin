/**
 * RTK Query API slice for partner review management
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

export const partnerReviewApi = createApi({
  reducerPath: 'partnerReviewApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PartnerReview', 'PartnerReviewList'],
  endpoints: (builder) => ({
    // Get all partners in review with pagination
    getPartnersInReview: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add search parameters
        if (params.search) searchParams.append('search', params.search);
        
        // Add filter parameters
        if (params.is_verified !== undefined) searchParams.append('is_verified', params.is_verified);
        if (params.is_active !== undefined) searchParams.append('is_active', params.is_active);
        
        const queryString = searchParams.toString();
        return `patner-in-review/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ uid }) => ({ 
                type: 'PartnerReview', 
                id: uid 
              })),
              { type: 'PartnerReviewList', id: 'LIST' },
            ]
          : [{ type: 'PartnerReviewList', id: 'LIST' }],
      transformResponse: (response) => {
        console.log('Partner Review API response:', response);
        
        // Handle paginated response structure
        if (response.results) {
          // Sort partners by creation date (newest first)
          const sortedResults = response.results.sort((a, b) => {
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
          });

          return {
            ...response,
            results: sortedResults
          };
        }
        
        // Fallback for non-paginated response (backward compatibility)
        return response.sort((a, b) => {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
      },
      transformErrorResponse: (response) => {
        console.error('Partner Review API error:', response);
        return response;
      },
    }),

    // Get single partner review by UID
    getPartnerReview: builder.query({
      query: (uid) => `patner-in-review/${uid}/`,
      providesTags: (result, error, uid) => [
        { type: 'PartnerReview', id: uid }
      ],
      transformResponse: (response) => {
        console.log('Single partner review API response:', response);
        return response;
      },
    }),

    // Approve or reject partner using single endpoint
    updatePartnerStatus: builder.mutation({
      query: ({ action, shop_uid }) => ({
        url: 'patner-in-review/',
        method: 'POST',
        body: { action, shop_uid },
      }),
      invalidatesTags: (result, error, { shop_uid }) => [
        { type: 'PartnerReview', id: shop_uid },
        { type: 'PartnerReviewList', id: 'LIST' },
      ],
    }),

    // Delete partner review
    deletePartnerReview: builder.mutation({
      query: (uid) => ({
        url: `patner-in-review/${uid}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, uid) => [
        { type: 'PartnerReview', id: uid },
        { type: 'PartnerReviewList', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetPartnersInReviewQuery,
  useGetPartnerReviewQuery,
  useUpdatePartnerStatusMutation,
  useDeletePartnerReviewMutation,
} = partnerReviewApi;

export default partnerReviewApi;
