import React, { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { Trip } from "../types/auth";
import { searchPublicTrips } from "../services/driverService";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/common";
import PublicTripHero from "../components/trip/PublicTripHero";
import PublicTripSearch from "../components/trip/PublicTripSearch";
import PublicTripList from "../components/trip/PublicTripList";
import PublicTripAwards from "../components/trip/PublicTripAwards";

const PublicTrips: React.FC = () => {
  const { isAuthenticated, loginWithEmail, register, loginWithGoogle } =
    useAuth();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("Male");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Hero Carousel States
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const heroSlidesCount = 4; // Hardcoded matches PublicTripHero slides length

  // Auto Slide Effect
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlidesCount);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Pause on hover
  useEffect(() => {
    const container = heroRef.current;
    if (!container) return;

    const pause = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const resume = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlidesCount);
      }, 5000);
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
    };
  }, []);

  const hasFilters = useMemo(
    () => !!origin || !!destination || !!date,
    [origin, destination, date]
  );

  const fetchTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchPublicTrips({
        origin: origin || undefined,
        destination: destination || undefined,
        date: date || undefined,
      });
      setTrips(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error?.response?.data?.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
      setShowAuthModal(false);
      toast.success("Logged in successfully. You can book now.");
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setAuthError(error?.response?.data?.message || "Invalid email or password");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (regPassword !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    try {
      await register(fullName, regEmail, contactNumber, gender, regPassword);
      setShowAuthModal(false);
      toast.success("Account created. You can book now.");
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setAuthError(error?.response?.data?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AppLayout
      title="Explore Trips"
      subtitle="Search available trips with advanced filters"
      publicMode={!isAuthenticated}
      onAuthOpen={() => {
        setAuthTab("login");
        setShowAuthModal(true);
      }}
      fullWidthChildren={true}
    >
      <div className="max-w-7xl mx-auto">
        <PublicTripHero
          currentSlide={currentSlide}
          heroRef={heroRef}
          carouselRef={carouselRef}
          goToSlide={setCurrentSlide}
        />

        <PublicTripSearch
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          date={date}
          setDate={setDate}
          onSearch={fetchTrips}
          onClear={() => {
            setOrigin("");
            setDestination("");
            setDate("");
            setTimeout(fetchTrips, 0);
          }}
          hasFilters={hasFilters}
        />

        <PublicTripList
          loading={loading}
          trips={trips}
          error={error}
          onTripClick={(id) => navigate(`/trips/${id}`)}
        />
      </div>

      <PublicTripAwards />

      {showAuthModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-emerald-900/20 p-7 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome to Soksabay Go
                </h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                  Login or register to start your Cambodia trip
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
              <button
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-bold ${authTab === "login"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500"
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-bold ${authTab === "register"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500"
                  }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {authError}
              </p>
            )}

            {authTab === "login" ? (
              <form onSubmit={handleAuthLogin} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <button
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 disabled:opacity-50 transition-all"
                >
                  {authLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthRegister} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                <button
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 disabled:opacity-50 transition-all"
                >
                  {authLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                or continue with
              </span>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50/40 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default PublicTrips;
