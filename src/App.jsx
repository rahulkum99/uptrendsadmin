import { Router as RouterProvider, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from "./redux/hooks/useAuth";
import { history } from "./utils/history";
import { startPerformanceMonitoring } from "./utils/performanceMonitor";

// Components
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Screens
import LoginScreen from "./screen/LoginScreen";
import Dashboard from "./screen/Dashboard";

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuth();

  // Initialize performance monitoring
  useEffect(() => {
    startPerformanceMonitoring();
  }, []);

  useEffect(() => {
    // Check authentication status when app loads
    const performAuthCheck = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    performAuthCheck();
  }, [checkAuth]); // Now safe to use checkAuth as it's memoized

  // Route configuration with proper route guards
  const routes = [
    { 
      path: "/", 
      element: (
        <PublicRoute>
          <LoginScreen />
        </PublicRoute>
      )
    },
    { 
      path: "/dashboard", 
      element: (
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      )
    },
    { 
      path: "*", 
      element: <Navigate to="/" replace /> 
    }
  ];


  return (
    <RouterProvider location={history.location} navigator={history}>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
      </Routes>
    </RouterProvider>
  );
}

export default App;
