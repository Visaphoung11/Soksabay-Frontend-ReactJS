import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading)
    return <div style={{ padding: "50px" }}>Checking Session...</div>;

  const hasUserRole = user?.role?.some((role) => {
    const normalized = role.toUpperCase();
    return normalized === "ROLE_USER" || normalized === "USER";
  });

  if (!isAuthenticated || !hasUserRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
