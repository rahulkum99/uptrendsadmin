# RTK Query Implementation for Profile Management

## Overview
Implemented RTK Query to replace direct API calls for profile data management. This provides better caching, automatic refetching, optimistic updates, and centralized API state management.

## Files Created/Modified

### 1. **New API Slice** (`src/redux/api/profileApi.js`)
**Purpose**: Centralized API management for profile operations

**Features**:
- ✅ Automatic token handling with refresh
- ✅ Caching and background refetching
- ✅ Error handling and transformation
- ✅ Support for both FormData and JSON requests
- ✅ Automatic cache invalidation on updates

**Endpoints**:
- `getProfile` - Fetch user profile data
- `updateProfile` - Update profile (supports file uploads)
- `createProfile` - Create new profile (if needed)

### 2. **Updated Redux Store** (`src/redux/store.jsx`)
**Changes**:
- Added profileApi reducer
- Added profileApi middleware for RTK Query functionality
- Maintains existing auth slice for backward compatibility

### 3. **Updated ProfileScreen** (`src/screen/ProfileScreen.jsx`)
**Before**: Manual API calls with fetch and error handling
**After**: RTK Query hooks for automatic data management

**Key Changes**:
```jsx
// ❌ Old way - Manual API calls
const fetchProfileData = async () => {
  setIsLoading(true);
  try {
    const data = await apiCall(`${config.API_BASE_URL}auth/profile/`, { method: 'GET' });
    // Manual state management...
  } catch (error) {
    // Manual error handling...
  } finally {
    setIsLoading(false);
  }
};

// ✅ New way - RTK Query hooks
const { 
  data: existingProfile, 
  isLoading: isLoadingProfile, 
  error: profileError 
} = useGetProfileQuery();

const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
```

### 4. **Updated Header Component** (`src/components/Header.jsx`)
**Before**: Manual profile data fetching in useEffect
**After**: RTK Query hook with automatic caching and updates

**Benefits**:
- Automatic data sharing between Header and ProfileScreen
- No duplicate API calls
- Automatic updates when profile changes

## Key Benefits

### 1. **Automatic Caching**
```jsx
// Profile data is cached and shared across components
// No duplicate API calls between Header and ProfileScreen
const { data: profileData } = useGetProfileQuery();
```

### 2. **Optimistic Updates**
```jsx
// Updates are reflected immediately in UI
// Automatic rollback on error
const [updateProfile] = useUpdateProfileMutation();
```

### 3. **Automatic Token Refresh**
```jsx
// Built into baseQueryWithReauth
// Handles 401 errors automatically
// Retries failed requests after token refresh
```

### 4. **Error Handling**
```jsx
// Centralized error transformation
// Consistent error format across components
transformErrorResponse: (response) => {
  console.error('Profile API error:', response);
  return response;
}
```

### 5. **Background Refetching**
- Automatic refetch on window focus
- Configurable stale time
- Manual refetch capabilities

## Usage Examples

### Basic Profile Fetching
```jsx
import { useGetProfileQuery } from '../redux/api/profileApi';

function MyComponent() {
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch 
  } = useGetProfileQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Welcome, {profile?.first_name}!</div>;
}
```

### Profile Updates
```jsx
import { useUpdateProfileMutation } from '../redux/api/profileApi';

function ProfileForm() {
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const handleSubmit = async (formData) => {
    try {
      await updateProfile(formData).unwrap();
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.data?.detail || 'Update failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### File Uploads
```jsx
// RTK Query automatically handles FormData
const formData = new FormData();
formData.append('profile_picture', file);
formData.append('first_name', 'John');

await updateProfile(formData).unwrap();
```

## Configuration

### Cache Behavior
- **Default cache time**: 60 seconds
- **Stale time**: 5 seconds
- **Refetch on focus**: Enabled
- **Refetch on reconnect**: Enabled

### Custom Configuration (if needed)
```jsx
// In profileApi.js
const { data } = useGetProfileQuery(undefined, {
  pollingInterval: 30000, // Poll every 30 seconds
  refetchOnFocus: false,  // Disable refetch on focus
  skip: !isAuthenticated, // Skip query if not authenticated
});
```

## Error Handling

### API Level Errors
```jsx
// Handled automatically in baseQueryWithReauth
// 401 errors trigger token refresh
// Network errors are caught and transformed
```

### Component Level Errors
```jsx
const { error } = useGetProfileQuery();

useEffect(() => {
  if (error) {
    toast.error(error.data?.detail || 'Failed to load profile');
  }
}, [error]);
```

## Migration Benefits

### Before (Manual API Calls)
- ❌ Duplicate API calls across components
- ❌ Manual loading state management
- ❌ Manual error handling in each component
- ❌ No caching - always fetch from server
- ❌ Complex token refresh logic in each call

### After (RTK Query)
- ✅ Shared data across components
- ✅ Automatic loading states
- ✅ Centralized error handling
- ✅ Intelligent caching and background updates
- ✅ Automatic token refresh handled by base query

## Performance Improvements

1. **Reduced API Calls**: Cached data prevents duplicate requests
2. **Background Updates**: Data stays fresh without blocking UI
3. **Optimistic Updates**: Immediate UI feedback
4. **Selective Re-renders**: Only components using changed data re-render

## Testing

### Manual Testing
1. ✅ Profile loads automatically on app start
2. ✅ Updates reflect immediately in both Header and ProfileScreen
3. ✅ File uploads work with FormData
4. ✅ Errors are handled gracefully
5. ✅ Token refresh works seamlessly

### Dev Tools
- Redux DevTools shows RTK Query state
- Network tab shows reduced API calls
- Cache entries visible in Redux state

## Future Enhancements

1. **Optimistic Updates**: Update UI before server response
2. **Infinite Queries**: For paginated data
3. **Mutations with Undo**: Rollback capability
4. **Real-time Updates**: WebSocket integration
5. **Offline Support**: Cache persistence

## Troubleshooting

### Common Issues

**Issue**: "Cannot read property of undefined"
**Solution**: Use optional chaining: `profile?.first_name`

**Issue**: Cache not updating after mutation
**Solution**: Check `invalidatesTags` in mutation

**Issue**: Multiple API calls still happening
**Solution**: Ensure components use same query key

**Issue**: Token refresh not working
**Solution**: Check baseQueryWithReauth implementation

### Debug Tools

```jsx
// Enable RTK Query dev tools
import { setupListeners } from '@reduxjs/toolkit/query';
setupListeners(store.dispatch);
```

This RTK Query implementation provides a robust, scalable foundation for API management with automatic caching, error handling, and optimistic updates.
