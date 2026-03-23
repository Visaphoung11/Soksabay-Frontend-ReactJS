import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import BecomeDriver from "./pages/BecomeDriver";
import { ToastContainer } from "react-toastify";

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
    <ToastContainer position="top-right" autoClose={4000} newestOnTop />
  </AuthProvider>
);

export default App;
