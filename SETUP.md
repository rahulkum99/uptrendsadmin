# Uptrends Admin Authentication Setup

## Overview
This React application implements a complete authentication system using Redux Toolkit (RTK) with the following features:

- Login/Logout functionality
- Token-based authentication (JWT)
- Protected routes
- Persistent authentication state
- Loading states and error handling

## Project Structure

```
src/
├── redux/
│   ├── store.js              # Redux store configuration
│   ├── slices/
│   │   └── authSlice.js      # Authentication slice with async thunks
│   └── hooks/
│       └── useAuth.js        # Custom hook for auth state and actions
├── screen/
│   ├── LoginScreen.jsx       # Login form component
│   └── Dashboard.jsx         # Protected dashboard component
├── routes/
│   ├── PrivateRoute.js       # Route protection for authenticated users
│   └── PublicRoute.js        # Route protection for non-authenticated users
├── utils/
│   └── api.js               # API configuration and helper functions
└── App.jsx                  # Main app component with routing
```

## Setup Instructions

### 1. Configure API Base URL
Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/

# App Configuration
VITE_APP_NAME=Uptrends Partners Admin
```

Or update the `API_BASE_URL` in `src/config/config.js`:

```javascript
API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com/',
```

### 2. Install Dependencies
The following dependencies are already included in package.json:
- @reduxjs/toolkit
- react-redux
- react-router-dom
- bootstrap

### 3. API Endpoint
The login endpoint expects:
- **URL**: `{{baseUrl}}auth/admin-login/`
- **Method**: POST
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "refresh_token": "jwt_refresh_token",
    "access_token": "jwt_access_token",
    "user": {
      "email": "user@example.com"
    },
    "is_verified": false,
    "detail": "Account verified successfully"
  }
  ```

## Features

### Authentication Flow
1. User enters credentials on login screen
2. Credentials are sent to API endpoint
3. On successful login:
   - Tokens are stored in localStorage
   - User state is updated in Redux
   - User is redirected to dashboard
4. On logout:
   - Tokens are removed from localStorage
   - User state is cleared
   - User is redirected to login

### Route Protection
- **Public Routes**: Only accessible when NOT authenticated
- **Private Routes**: Only accessible when authenticated
- Automatic redirects based on authentication status

### State Management
- **Loading States**: Shows spinners during API calls
- **Error Handling**: Displays error messages from API
- **Persistent Auth**: Maintains login state across page refreshes

## Usage

### Using the useAuth Hook
```javascript
import { useAuth } from './redux/hooks/useAuth';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    logout 
  } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password' });
  };

  const handleLogout = async () => {
    await logout();
  };
};
```

### Adding New Protected Routes
```javascript
// In App.jsx
const privateRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/users", component: <Users /> }, // Add new routes here
];
```

## Demo Credentials
For testing purposes, you can use:
- **Email**: salon4mein@gmail.com
- **Password**: Rahul@123

## Security Notes
- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- Implement token refresh mechanism for production use
- Add proper error boundaries and validation
- Consider implementing rate limiting on the frontend

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure your API server allows requests from your frontend domain
2. **Token Expiry**: Implement token refresh logic for production
3. **Route Protection**: Ensure all private routes are properly wrapped with PrivateRoute component

### Development
Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`
