// Login.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../components/Login.css"; // Ensure this file exists!

const Login: React.FC = () => {
  const { login } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await login(); // your oauth / firebase / supabase / ... call
    } catch (err) {
      console.error("Google login failed", err);
      // you can show toast/notification here
    } finally {
      // optional: small delay so user sees loading state
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${isLoading ? "loading" : ""}`}>
        <div className="logo-container">
          <div className="brand-glow" />
          <h1 className="brand-title">Your App</h1>
          <p className="brand-subtitle">Sign in to continue</p>
        </div>

        <button
          className={`google-btn ${isHovered ? "hover" : ""} ${
            isLoading ? "loading" : ""
          }`}
          onClick={handleGoogleLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isLoading}
        >
          <div className="google-icon-wrapper">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="google-icon"
            />
            {/* Alternative: official 24px Google G */}
            {/* src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" */}
          </div>

          <span className="btn-text">
            {isLoading ? "Connecting..." : "Continue with Google"}
          </span>

          <div className="ripple" />
        </button>

        <div className="footer-text">
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default Login;
