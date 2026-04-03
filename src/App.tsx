import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import BecomeDriver from "./pages/BecomeDriver";
import DriverTrips from "./pages/DriverTrips";
import PublicTrips from "./pages/PublicTrips";
import MyBookings from "./pages/MyBookings";
import DriverBookingRequests from "./pages/DriverBookingRequests";
import Profile from "./pages/Profile";
import TripDetail from "./pages/TripDetail";
import DriverTripDetail from "./pages/DriverTripDetail";
import DriverPublicProfile from "./pages/DriverPublicProfile";
import Chat from "./pages/Chat";
import { ToastContainer } from "react-toastify";
import URLSwitcher from "./components/URLSwitcher";

// Page transition animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const
    }
  }
};

// Wrapper component for animated routes
const AnimatedRoute = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AnimatedRoute><PublicTrips /></AnimatedRoute>} />
      <Route path="/login" element={<AnimatedRoute><Login /></AnimatedRoute>} />
      <Route path="/trips" element={<Navigate to="/" replace />} />
      <Route path="/trips/:id" element={<AnimatedRoute><TripDetail /></AnimatedRoute>} />
      <Route path="/drivers/:driverId" element={<AnimatedRoute><DriverPublicProfile /></AnimatedRoute>} />

      <Route
        path="/become-driver"
        element={
          <ProtectedRoute>
            <AnimatedRoute><BecomeDriver /></AnimatedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/trips"
        element={
          <ProtectedRoute>
            <AnimatedRoute><DriverTrips /></AnimatedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/trips/:id"
        element={
          <ProtectedRoute>
            <AnimatedRoute><DriverTripDetail /></AnimatedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <AnimatedRoute><MyBookings /></AnimatedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/bookings/requests"
        element={
          <ProtectedRoute>
            <AnimatedRoute><DriverBookingRequests /></AnimatedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AnimatedRoute><Profile /></AnimatedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AnimatedRoute><Chat /></AnimatedRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AnimatePresence mode="wait">
        <AnimatedRoutes />
      </AnimatePresence>
    </Router>
    <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    <URLSwitcher />
  </AuthProvider>
);

export default App;
