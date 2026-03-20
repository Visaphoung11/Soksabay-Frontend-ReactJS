import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "../types/auth";
import { registerUser, loginUser } from "../services/authService";
import { api } from "../lib/axios";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KEYS = {
  USER: "soksabay_user",
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
  HINT: "auth_hint",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      // 1. Check if tokens came back as URL query params (some OAuth2 backends do this)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("accessToken") || params.get("token");
      if (urlToken) {
        // Store token then fetch user profile
        localStorage.setItem(KEYS.ACCESS, urlToken);
        const refreshToken = params.get("refreshToken") || "";
        if (refreshToken) localStorage.setItem(KEYS.REFRESH, refreshToken);
        localStorage.setItem(KEYS.HINT, "true");
        // Clean the URL
        window.history.replaceState({}, document.title, window.location.pathname);
        await fetchAndPersistUserFromServer(urlToken);
        return;
      }

      // 2. Try to rehydrate from persisted localStorage user (email/pw login)
      const storedUser = localStorage.getItem(KEYS.USER);
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
        setLoading(false);
        return;
      }

      // 3. OAuth2 cookie flow – check hint and call /users/me with the HttpOnly cookie
      const hasHint = localStorage.getItem(KEYS.HINT) === "true";
      if (hasHint) {
        await fetchAndPersistUserFromServer();
        return;
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calls /users/me using the HttpOnly cookie (OAuth2) OR the Bearer token.
   * Maps whatever the server returns into our User shape.
   */
  const fetchAndPersistUserFromServer = async (bearerToken?: string) => {
    try {
      const config = bearerToken
        ? { headers: { Authorization: `Bearer ${bearerToken}` } }
        : {};
      const res = await api.get("/users/me", config);
      const raw = res.data?.data ?? res.data; // handle {data:{...}} or flat object
      const mapped: User = {
        userId: raw.userId ?? raw.id ?? 0,
        email: raw.email ?? "",
        fullName: raw.fullName ?? raw.name ?? raw.email?.split("@")[0] ?? "User",
        gender: raw.gender ?? "",
        contactNumber: raw.contactNumber ?? "",
        role: raw.role ?? raw.roles ?? ["USER"],
        accessToken: bearerToken ?? raw.accessToken ?? localStorage.getItem(KEYS.ACCESS) ?? "",
        refreshToken: raw.refreshToken ?? localStorage.getItem(KEYS.REFRESH) ?? "",
      };
      persistUser(mapped);
    } catch {
      clearAuth();
      throw new Error("Could not fetch user");
    }
  };

  const persistUser = (u: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(u));
    if (u.accessToken) localStorage.setItem(KEYS.ACCESS, u.accessToken);
    if (u.refreshToken) localStorage.setItem(KEYS.REFRESH, u.refreshToken);
    localStorage.setItem(KEYS.HINT, "true");
    setUser(u);
  };

  const clearAuth = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setUser(null);
  };

  const register = async (
    fullName: string,
    email: string,
    contactNumber: string,
    gender: string,
    password: string
  ) => {
    const res = await registerUser({ fullName, email, contactNumber, gender, password });
    // Register doesn't return full user profile; build a minimal one
    const u: User = {
      userId: 0,
      email,
      fullName,
      gender,
      contactNumber,
      role: ["USER"],
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
    persistUser(u);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    persistUser(res.data);
  };

  const loginWithGoogle = () => {
    localStorage.setItem(KEYS.HINT, "true");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const logout = () => {
    clearAuth();
  };

  const refreshUser = async () => {
    await fetchAndPersistUserFromServer();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
