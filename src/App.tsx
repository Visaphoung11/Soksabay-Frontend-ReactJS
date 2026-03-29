import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import BecomeDriver from "./pages/BecomeDriver";
import DriverTrips from "./pages/DriverTrips";
import PublicTrips from "./pages/PublicTrips";
import MyBookings from "./pages/MyBookings";
import DriverBookingRequests from "./pages/DriverBookingRequests";
import Profile from "./pages/Profile";
import TripDetail from "./pages/TripDetail";
import DriverTripDetail from "./pages/DriverTripDetail";
import { ToastContainer } from "react-toastify";
import URLSwitcher from "./components/URLSwitcher";

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicTrips />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trips" element={<PublicTrips />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/become-driver"
          element={
            <ProtectedRoute>
              <BecomeDriver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/trips"
          element={
            <ProtectedRoute>
              <DriverTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/trips/:id"
          element={
            <ProtectedRoute>
              <DriverTripDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/bookings/requests"
          element={
            <ProtectedRoute>
              <DriverBookingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/trips" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
    <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    <URLSwitcher />
  </AuthProvider>
);

export default App;
