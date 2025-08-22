import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { profileApi } from './api/profileApi';
import { customerApi } from './api/customerApi';
import { partnerApi } from './api/partnerApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [partnerApi.reducerPath]: partnerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess', 'auth/logout'],
        ignoredPaths: ['auth.user'],
      },
      immutableCheck: {
        // Reduce the warning threshold or disable in development if needed
        warnAfter: 128, // Increase threshold from 32ms to 128ms
      },
    }).concat(profileApi.middleware, customerApi.middleware, partnerApi.middleware),
});

// TypeScript-style type exports (commented out for JavaScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
