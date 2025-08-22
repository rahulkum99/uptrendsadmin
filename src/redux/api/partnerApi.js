import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/config';
import authService from '../../services/authService';

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await fetchBaseQuery({
    baseUrl: config.API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = authService.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  })(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log('Token expired, attempting refresh...');
    try {
      const newAccessToken = await authService.refreshAccessToken();
      if (newAccessToken) {
        result = await fetchBaseQuery({
          baseUrl: config.API_BASE_URL,
          prepareHeaders: (headers) => {
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            return headers;
          },
        })(args, api, extraOptions);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // Only logout if refresh actually fails
      authService.logout();
    }
  }
  return result;
};

export const partnerApi = createApi({
  reducerPath: 'partnerApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Partner', 'PartnerList'],
  endpoints: (builder) => ({
    getPartners: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) {
          searchParams.append('page', params.page);
        }
        if (params.limit) {
          searchParams.append('limit', params.limit);
        }
        
        // Add search parameter
        if (params.search) {
          searchParams.append('q', params.search);
        }
        
        // Add status filter
        if (params.is_active !== undefined) {
          searchParams.append('is_active', params.is_active);
        }
        
        // Add service type filter
        if (params.service_type) {
          searchParams.append('service_type', params.service_type);
        }
        
        // Add city filter
        if (params.city) {
          searchParams.append('city', params.city);
        }
        
        const queryString = searchParams.toString();
        return `adminuser/all-patner/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ uid }) => ({ type: 'Partner', id: uid })),
              { type: 'PartnerList', id: 'LIST' },
            ]
          : [{ type: 'PartnerList', id: 'LIST' }],
      transformResponse: (response) => {
        console.log('Partner API response:', response);
        if (response.results) {
          // Sort partners by active status and then by name
          const sortedResults = response.results.sort((a, b) => {
            if (a.is_active !== b.is_active) {
              return b.is_active - a.is_active;
            }
            return a.service_name.localeCompare(b.service_name);
          });
          return { ...response, results: sortedResults };
        }
        return response;
      },
    }),
    updatePartnerStatus: builder.mutation({
      query: ({ uid, is_active }) => ({
        url: `adminuser/all-patner/${uid}/`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (result, error, { uid }) => [
        { type: 'Partner', id: uid }, 
        { type: 'PartnerList', id: 'LIST' }
      ],
    }),
    deletePartner: builder.mutation({
      query: (uid) => ({
        url: `adminuser/all-patner/${uid}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, uid) => [
        { type: 'Partner', id: uid }, 
        { type: 'PartnerList', id: 'LIST' }
      ],
    }),
  }),
});

export const { 
  useGetPartnersQuery, 
  useUpdatePartnerStatusMutation, 
  useDeletePartnerMutation 
} = partnerApi;
