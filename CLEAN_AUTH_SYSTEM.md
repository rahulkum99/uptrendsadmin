# Clean Authentication System

## Overview
This is a complete rewrite of the authentication system with a focus on simplicity and maintainability.

## Architecture

### 1. **AuthService** (`src/services/authService.js`)
**Single responsibility**: Handle all authentication operations
- Token storage and retrieval
- Token validation and refresh
- Authenticated API calls
- Login/logout operations

**Key Features**:
- Automatic token refresh before expiration
- Prevents multiple simultaneous refresh calls
- Handles both `access` and `access_token` response formats
- Automatic logout on authentication failure

### 2. **AuthContext** (`src/contexts/AuthContext.jsx`)
**Single responsibility**: Provide authentication state to components
- User state management
- Loading states
- Error handling
- React context for easy access

### 3. **useAutoRefresh** (`src/hooks/useAutoRefresh.js`)
**Single responsibility**: Automatically refresh tokens before expiration
- Schedules refresh 5 minutes before token expires
- Handles immediate refresh for soon-to-expire tokens
- Cleans up timeouts properly

## Usage

### Basic Authentication
```jsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={login} />
      )}
    </div>
  );
}
```

### Making API Calls
```jsx
import { useAuth } from './hooks/useAuth';

function DataComponent() {
  const { apiCall } = useAuth();
  
  const fetchData = async () => {
    try {
      const data = await apiCall('/api/data', { method: 'GET' });
      console.log(data);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };
  
  return <button onClick={fetchData}>Fetch Data</button>;
}
```

### Direct Service Usage (Advanced)
```jsx
import authService from './services/authService';

// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Make API call
const data = await authService.apiCall('/api/endpoint');

// Manual token refresh
await authService.refreshAccessToken();
```

## File Structure
```
src/
├── services/
│   └── authService.js          # Core auth logic
├── contexts/
│   └── AuthContext.jsx         # React context
├── hooks/
│   ├── useAuth.js             # Auth hook
│   └── useAutoRefresh.js      # Auto refresh hook
└── utils/
    └── api.js                 # Deprecated utilities
```

## Migration from Old System

### Old Redux-based approach:
```jsx
// ❌ Old way
import { useAuth } from './redux/hooks/useAuth';
const { refreshToken, access_token } = useAuth();
```

### New Context-based approach:
```jsx
// ✅ New way
import { useAuth } from './hooks/useAuth';
const { user, apiCall } = useAuth();
```

## Key Benefits

### 1. **Simplicity**
- Single service handles all auth logic
- No complex Redux actions/reducers
- Clear separation of concerns

### 2. **Maintainability**
- Easy to understand code flow
- Centralized error handling
- Minimal dependencies

### 3. **Reliability**
- Prevents race conditions
- Automatic cleanup
- Proper error boundaries

### 4. **Developer Experience**
- Simple API
- Clear error messages
- Good TypeScript support (if needed)

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:8000/
```

### API Endpoints Expected
- `POST /auth/admin-login/` - Login
- `POST /auth/token/refresh/` - Refresh token
- `GET /auth/profile/` - User profile

### Token Response Formats Supported
```json
// Login response
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
}

// Refresh response (either format works)
{
  "access": "..."
}
// OR
{
  "access_token": "..."
}
```

## Debugging

### Console Messages
- `"Token refreshed successfully"` - Refresh successful
- `"Auto refresh scheduled in X minutes"` - Automatic refresh scheduled
- `"Token expired, refreshing..."` - Automatic refresh triggered
- `"Token refresh failed: ..."` - Refresh error

### Common Issues

**Issue**: "No refresh token available"
**Solution**: User needs to login again

**Issue**: "No access token in refresh response"
**Solution**: Check API response format

**Issue**: Multiple refresh calls
**Solution**: Already handled by service (uses promise caching)

## Testing

### Manual Testing
1. Login to application
2. Check browser console for refresh scheduling
3. Wait for automatic refresh (or modify token expiry)
4. Verify new token is received

### Unit Testing (Future)
```jsx
// Example test structure
describe('AuthService', () => {
  test('should refresh token automatically', async () => {
    // Test implementation
  });
});
```

## Production Checklist

- [ ] Remove debug console logs
- [ ] Set proper API_BASE_URL
- [ ] Test token refresh flow
- [ ] Verify logout redirects
- [ ] Test error handling

## Future Enhancements

1. **TypeScript Support**: Add proper types
2. **Offline Support**: Cache tokens securely
3. **Multiple Auth Providers**: Social login support
4. **Token Encryption**: Encrypt stored tokens
5. **Session Management**: Handle multiple tabs

## Troubleshooting

### Common Problems

1. **Infinite refresh loops**: Check token expiry logic
2. **Context not found errors**: Ensure AuthProvider wraps App
3. **API calls failing**: Check token format and headers
4. **Logout not working**: Verify localStorage clearing

### Debug Steps

1. Check browser localStorage for tokens
2. Monitor network tab for API calls
3. Check console for error messages
4. Verify API_BASE_URL configuration
