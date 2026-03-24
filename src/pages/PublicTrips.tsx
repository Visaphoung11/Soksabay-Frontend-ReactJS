import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { Trip } from "../types/auth";
import { createBooking, getPublicTripById, searchPublicTrips } from "../services/driverService";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const PublicTrips: React.FC = () => {
  const { isAuthenticated, loginWithEmail, register, loginWithGoogle } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [seatsBooked, setSeatsBooked] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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

  const hasFilters = useMemo(() => !!origin || !!destination || !!date, [origin, destination, date]);

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
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const openTripDetail = async (id: number) => {
    try {
      const detail = await getPublicTripById(id);
      setSelectedTrip(detail);
      setActiveImage(0);
      setSeatsBooked(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load trip details");
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedTrip) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!seatsBooked || seatsBooked < 1) {
      toast.error("Please select at least 1 seat");
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({
        tripId: selectedTrip.id,
        seatsBooked: Number(seatsBooked),
      });
      toast.success("Booking created (PENDING)");
      setSelectedTrip(null);
      await fetchTrips();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
      setShowAuthModal(false);
      setShowLoginPrompt(false);
      toast.success("Logged in successfully. You can book now.");
    } catch (err: any) {
      setAuthError(err?.response?.data?.message || "Invalid email or password");
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
      setShowLoginPrompt(false);
      toast.success("Account created. You can book now.");
    } catch (err: any) {
      setAuthError(err?.response?.data?.message || "Registration failed");
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
    >
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin"
              className="px-4 py-3 rounded-xl border border-slate-200"
            />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination"
              className="px-4 py-3 rounded-xl border border-slate-200"
            />
            <input
              type="date"
              aria-label="Filter by departure date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200"
            />
            <div className="flex gap-2">
              <button
                onClick={fetchTrips}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setOrigin("");
                  setDestination("");
                  setDate("");
                  setTimeout(fetchTrips, 0);
                }}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          </div>
          {hasFilters && <p className="text-xs text-slate-500 mt-3">Filtering active</p>}
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="py-20 text-center text-slate-500">No trips found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => openTripDetail(trip.id)}
                className="text-left bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={trip.images?.[0] || "https://placehold.co/800x500?text=Trip+Image"}
                    alt={trip.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/90 text-blue-700 font-black text-xs flex items-center justify-center shadow-lg">
                      SG
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-slate-700">
                      Verified Driver
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-black text-white text-lg leading-tight line-clamp-1">{trip.title}</h3>
                      <p className="text-white/80 text-xs line-clamp-1">{trip.origin} → {trip.destination}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white">
                      {trip.categoryName || "Trip"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                    {trip.description || "No description provided for this trip."}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-black text-base">${trip.pricePerSeat}/seat</span>
                    <span className="text-slate-500 font-semibold">{trip.availableSeats}/{trip.totalSeats} seats</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Driver: {trip.driverName || "Unknown"}</span>
                    <span className="font-semibold">{new Date(trip.departureTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold">{selectedTrip.title}</h2>
              <button onClick={() => setSelectedTrip(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            <div className="relative">
              <img
                src={selectedTrip.images?.[activeImage] || "https://placehold.co/1200x700?text=Trip+Image"}
                alt={selectedTrip.title}
                className="w-full h-72 md:h-96 object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 text-[10px] font-black uppercase tracking-widest text-slate-700">
                Soksabay Go • {selectedTrip.categoryName || "Trip"}
              </div>
            </div>
            <div className="p-4 flex gap-2 overflow-x-auto border-b border-slate-100">
              {(selectedTrip.images || []).map((img, idx) => (
                <button key={`${img}-${idx}`} onClick={() => setActiveImage(idx)}>
                  <img
                    src={img}
                    alt={`Trip ${idx + 1}`}
                    className={`w-20 h-20 rounded-lg object-cover border-2 ${activeImage === idx ? "border-blue-500" : "border-transparent"}`}
                  />
                </button>
              ))}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold">Route:</span> {selectedTrip.origin} → {selectedTrip.destination}</p>
              <p><span className="font-semibold">Driver:</span> {selectedTrip.driverName}</p>
              <p><span className="font-semibold">Category:</span> {selectedTrip.categoryName}</p>
              <p><span className="font-semibold">Departure:</span> {new Date(selectedTrip.departureTime).toLocaleString()}</p>
              <p><span className="font-semibold">Price:</span> ${selectedTrip.pricePerSeat}/seat</p>
              <p><span className="font-semibold">Seats:</span> {selectedTrip.availableSeats}/{selectedTrip.totalSeats}</p>
              <p className="md:col-span-2"><span className="font-semibold">Description:</span> {selectedTrip.description}</p>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Seats to book</label>
                  <input
                    type="number"
                    aria-label="Seats to book"
                    min={1}
                    max={Math.max(1, Number(selectedTrip.availableSeats || 1))}
                    value={seatsBooked}
                    onChange={(e) => setSeatsBooked(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <button
                  onClick={handleCreateBooking}
                  disabled={bookingLoading || Number(selectedTrip.availableSeats) <= 0}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {bookingLoading ? "Booking..." : Number(selectedTrip.availableSeats) <= 0 ? "No Seats Available" : "Book This Trip"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xl font-black text-slate-900 mb-2">Login Required</h3>
            <p className="text-sm text-slate-600 mb-5">
              You can browse all public trips without login. To book a trip, please login first.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-blue-900/20 p-7 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900 font-outfit">Welcome Back</h3>
                <p className="text-xs text-slate-500 mt-1">Login or create account to continue booking</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
              <button
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-semibold ${authTab === "login" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-semibold ${authTab === "register" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                Register
              </button>
            </div>

            {authError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{authError}</p>}

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
                <button disabled={authLoading} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all">
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
                <button disabled={authLoading} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all">
                  {authLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            <button
              onClick={() => loginWithGoogle()}
              className="w-full mt-3 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/40 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all"
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
