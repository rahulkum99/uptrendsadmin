import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from "./redux/hooks/useAuth";

import PrivateRoute from "./routes/PrivateRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

// Screens
import LoginScreen from "./screen/LoginScreen";
import Dashboard from "./screen/Dashboard";

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    console.log('App useEffect - checking auth');
    
    // Check authentication status when app loads
    const performAuthCheck = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.log('Auth check error:', error);
      } finally {
        // Set auth check as complete after 2 seconds max
        setTimeout(() => {
          setAuthCheckComplete(true);
        }, 2000);
      }
    };

    performAuthCheck();
  }, [checkAuth]); // Now safe to use checkAuth as it's memoized

  const publicRoutes = [
    { path: "/", component: <LoginScreen /> },
  ];

  const privateRoutes = [
    { path: "/dashboard", component: <Dashboard /> },
  ];

  // Debug logging
  console.log('App render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'authCheckComplete:', authCheckComplete);

  // Show loading spinner while checking auth status (with timeout)
  if (isLoading && !authCheckComplete) {
    console.log('Showing loading spinner');
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main app with routes');
  return (
    <Router>
      <Routes>
        {publicRoutes.map(({ path, component }) => (
          <Route
            key={path}
            path={path}
            element={<PublicRoute>{component}</PublicRoute>}
          />
        ))}
        {privateRoutes.map(({ path, component }) => (
          <Route
            key={path}
            path={path}
            element={<PrivateRoute>{component}</PrivateRoute>}
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
