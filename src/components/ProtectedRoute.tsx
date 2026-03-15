import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading)
    return <div style={{ padding: "50px" }}>Checking Session...</div>;

  // Safe check for the ROLE_USER authority
  const hasUserRole = user?.roles?.some((role: any) => {
    const roleName = typeof role === "string" ? role : role.authority;
    return roleName === "ROLE_USER";
  });

  if (!isAuthenticated || !hasUserRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
