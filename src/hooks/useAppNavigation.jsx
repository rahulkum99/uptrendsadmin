import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = (path, options = {}) => {
    const { replace = true, state = null } = options;
    
    if (replace) {
      navigate(path, { replace: true, state });
    } else {
      navigate(path, { replace: false, state });
    }
  };

  const navigateToLogin = () => {
    navigate('/', { replace: true });
  };

  const navigateToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  const reloadPage = () => {
    // Use replace to avoid history warning
    window.location.replace(window.location.pathname);
  };

  const redirectToLogin = () => {
    // Use replace to avoid history warning
    window.location.replace('/');
  };

  return {
    navigateTo,
    navigateToLogin,
    navigateToDashboard,
    reloadPage,
    redirectToLogin
  };
};
