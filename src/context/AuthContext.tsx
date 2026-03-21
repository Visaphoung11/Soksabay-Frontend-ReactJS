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

      // 2. Rehydrate quickly from local storage for token-based login flow.
      const storedUser = localStorage.getItem(KEYS.USER);
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
      }

      // 3. Cookie-first flow only when we have an auth hint.
      // Avoid calling /users/me on first app load before login.
      const hasHint = localStorage.getItem(KEYS.HINT) === "true";
      if (hasHint) {
        await fetchAndPersistUserFromServer(undefined, false);
      }
      return;
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
  const fetchAndPersistUserFromServer = async (bearerToken?: string, throwOnError = true) => {
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
        accessToken: bearerToken ?? raw.accessToken ?? "",
        refreshToken: raw.refreshToken ?? "",
      };
      persistUser(mapped);
    } catch {
      clearAuth();
      if (throwOnError) {
        throw new Error("Could not fetch user");
      }
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

    // Support old flow: backend returns tokens directly on register.
    if (res?.accessToken) {
      const u: User = {
        userId: 0,
        email,
        fullName,
        gender,
        contactNumber,
        role: ["USER"],
        accessToken: res.accessToken,
        refreshToken: res.refreshToken ?? "",
      };
      persistUser(u);
      await fetchAndPersistUserFromServer(res.accessToken, false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    const raw = (res as any)?.data ?? {};

    const mapped: User = {
      userId: raw.userId ?? raw.id ?? 0,
      email: raw.email ?? email,
      fullName: raw.fullName ?? raw.name ?? email.split("@")[0] ?? "User",
      gender: raw.gender ?? "",
      contactNumber: raw.contactNumber ?? "",
      role: raw.role ?? raw.roles ?? ["USER"],
      accessToken: raw.accessToken ?? "",
      refreshToken: raw.refreshToken ?? "",
    };

    persistUser(mapped);
    await fetchAndPersistUserFromServer(mapped.accessToken || undefined, false);
  };

  const loginWithGoogle = () => {
    localStorage.setItem(KEYS.HINT, "true");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const logout = async () => {
    try {
      // Hit backend logout endpoint explicitly and skip Bearer injection
      // so cookie-based logout can always clear HttpOnly cookie.
      await api.post("/auth/logout", null, { skipAuth: true } as any);
    } catch {
      // ignore backend logout failures and clear local state anyway
    } finally {
      clearAuth();
    }
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
