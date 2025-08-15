import { createBrowserHistory } from 'history';

// Create a custom history object with stable configuration
export const history = createBrowserHistory({
  basename: '/',
  forceRefresh: false,
  keyLength: 6,
  getUserConfirmation: (message, callback) => {
    // Always confirm navigation to prevent warnings
    callback(true);
  }
});

// Export a stable navigate function
export const navigate = (path, options = {}) => {
  const { replace = true, state = null } = options;
  
  if (replace) {
    history.replace(path, state);
  } else {
    history.push(path, state);
  }
};

// Export specific navigation functions
export const navigateToLogin = () => {
  history.replace('/');
};

export const navigateToDashboard = () => {
  history.replace('/dashboard');
};

export const reloadPage = () => {
  // Use replace to avoid history warning
  if (typeof window !== 'undefined') {
    window.location.replace(window.location.pathname);
  }
};

export const redirectToLogin = () => {
  // Use replace to avoid history warning
  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }
};
