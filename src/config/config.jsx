// Environment Configuration
const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  
  // App Configuration
  APP_NAME: 'Uptrends Partners Admin',
  
  // Auth Configuration
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  
  // Routes
  ROUTES: {
    LOGIN: '/',
    DASHBOARD: '/dashboard',
  },
};

export default config;
