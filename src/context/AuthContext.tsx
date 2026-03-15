import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "../types/auth";
import { api } from "../lib/axios";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // 1. Check if we have a hint that the user is logged in
      const hasHint = localStorage.getItem("auth_hint") === "true";

      // 2. If no hint, don't even make the API call (prevents 401 error)
      if (!hasHint) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<User>("/users/me");
        setUser(response.data);
      } catch (error) {
        setUser(null);
        localStorage.removeItem("auth_hint");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    // Set the hint BEFORE redirecting so the app knows to check on return
    localStorage.setItem("auth_hint", "true");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("auth_hint");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
