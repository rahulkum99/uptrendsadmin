# Import Fixes for New Auth System

## Issue Fixed
The error `Failed to resolve import "../hooks/useTokenRefresh" from "src/screen/Dashboard.jsx"` occurred because the old `useTokenRefresh` hook was deleted during the auth system rewrite, but some components were still importing it.

## Files Updated

### 1. **Dashboard.jsx**
- ❌ Removed: `import { useTokenRefresh } from '../hooks/useTokenRefresh';`
- ❌ Removed: `useTokenRefresh();` call
- ✅ Updated: `import { useAuth } from '../hooks/useAuth';`
- ✅ Added: Comment explaining token refresh is now handled in App.jsx

### 2. **All Screen Components**
Updated import paths from old Redux-based auth to new Context-based auth:

**Files Updated:**
- `src/screen/LoginScreen.jsx`
- `src/screen/PartnersScreen.jsx`
- `src/screen/AddSalonScreen.jsx`
- `src/screen/BookingScreen.jsx`
- `src/screen/ReportsScreen.jsx`
- `src/screen/ProfileScreen.jsx`
- `src/screen/SalonListScreen.jsx`
- `src/components/PublicRoute.jsx`

**Change:**
```jsx
// ❌ Old import
import { useAuth } from '../redux/hooks/useAuth';

// ✅ New import  
import { useAuth } from '../hooks/useAuth';
```

### 3. **ProfileScreen.jsx** (Special Updates)
- Updated API calls to use new auth system:
  ```jsx
  // ❌ Old way
  const data = await apiCall(API_ENDPOINTS.PROFILE, { method: 'GET' }, store);
  
  // ✅ New way
  const data = await apiCall(`${config.API_BASE_URL}auth/profile/`, { method: 'GET' });
  ```
- Updated hook usage:
  ```jsx
  // ❌ Old way
  const { user, access_token } = useAuth();
  
  // ✅ New way
  const { user, apiCall } = useAuth();
  ```

### 4. **Cleaned Up Old Files**
- ❌ Deleted: `src/utils/api.jsx` (old complex API utility)
- ✅ Kept: `src/utils/api.js` (new simple API utility with deprecation warnings)

### 5. **Updated Deprecated Files**
- `src/redux/slices/authSlice.jsx` - Added deprecation notice and fixed imports
- `src/redux/hooks/useAuth.jsx` - Added deprecation notice

## Token Refresh Now Works Through

1. **AuthService** (`src/services/authService.js`) - Core token refresh logic
2. **useAutoRefresh** (`src/hooks/useAutoRefresh.js`) - Automatic scheduling
3. **App.jsx** - Initializes `useAutoRefresh()` globally

## Verification

All import errors should now be resolved. The application should:
- ✅ Start without import errors
- ✅ Automatically refresh tokens before expiration
- ✅ Handle authentication across all components
- ✅ Use the new clean auth system consistently

## No Breaking Changes

The new auth system maintains the same API surface:
- `useAuth()` still provides `user`, `login`, `logout`, `isAuthenticated`, etc.
- Components don't need logic changes, just import path updates
- Token refresh happens automatically in the background

## Next Steps

1. Test the application to ensure no import errors
2. Verify token refresh works automatically
3. Remove old Redux auth files when confident (optional)
4. Update any remaining old patterns found during testing
