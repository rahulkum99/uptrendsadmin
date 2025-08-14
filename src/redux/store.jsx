import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
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
    }),
});

// TypeScript-style type exports (commented out for JavaScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
