import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "./hooks/useAuth";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { startPerformanceMonitoring } from "./utils/performanceMonitor";

// Components
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Screens
import LoginScreen from "./screen/LoginScreen";
import Dashboard from "./screen/Dashboard";
import PartnersScreen from "./screen/PartnersScreen";
import AddSalonScreen from "./screen/AddSalonScreen";
import BookingScreen from "./screen/BookingScreen";
import ReportsScreen from "./screen/ReportsScreen";
import ProfileScreen from "./screen/ProfileScreen";
import CustomerScreen from "./screen/CustomerScreen";
import PartnerReviewScreen from "./screen/PartnerReviewScreen";

function App() {
  const { isLoading, isAuthenticated } = useAuth();
  
  // Initialize automatic token refresh
  useAutoRefresh();

  // Initialize performance monitoring
  useEffect(() => {
    startPerformanceMonitoring();
  }, []);

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PublicRoute>
                <LoginScreen />
              </PublicRoute>
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/partners" 
          element={
            <PrivateRoute>
              <PartnersScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/partner-review" 
          element={
            <PrivateRoute>
              <PartnerReviewScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/add-salon" 
          element={
            <PrivateRoute>
              <AddSalonScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/bookings" 
          element={
            <PrivateRoute>
              <BookingScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <PrivateRoute>
              <ReportsScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfileScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <PrivateRoute>
              <CustomerScreen />
            </PrivateRoute>
          } 
        />
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
          } 
        />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
