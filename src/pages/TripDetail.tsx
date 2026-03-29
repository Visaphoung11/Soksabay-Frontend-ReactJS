import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { createBooking, getPublicTripById } from "../services/driverService";
import type { Trip } from "../types/auth";

const TripDetail: React.FC = () => {
  const { id } = useParams();
  const tripId = Number(id);
  const navigate = useNavigate();

  const { isAuthenticated, loginWithEmail, register, loginWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // booking
  const [seatsBooked, setSeatsBooked] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // auth modal (copied from PublicTrips for consistent UX)
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

  const images = useMemo(() => trip?.images || [], [trip]);
  const vehicleImages = useMemo(() => trip?.vehicleImageUrls || [], [trip]);

  useEffect(() => {
    if (!tripId || Number.isNaN(tripId)) {
      toast.error("Invalid trip id");
      navigate("/trips", { replace: true });
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const detail = await getPublicTripById(tripId);
        setTrip(detail);
        setActiveImage(0);
        setSeatsBooked(1);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load trip details");
        navigate("/trips", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [tripId]);

  const handleCreateBooking = async () => {
    if (!trip) return;
    if (!isAuthenticated) {
      setAuthTab("login");
      setAuthError("");
      setShowAuthModal(true);
      return;
    }

    if (!seatsBooked || seatsBooked < 1) {
      toast.error("Please select at least 1 seat");
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({ tripId: trip.id, seatsBooked: Number(seatsBooked) });
      toast.success("Booking created (PENDING)");
      navigate("/bookings");
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
      toast.success("Account created. You can book now.");
    } catch (err: any) {
      setAuthError(err?.response?.data?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AppLayout
      title={trip ? trip.title : "Trip Details"}
      subtitle={trip ? `${trip.origin} → ${trip.destination}` : "Loading trip..."}
      publicMode={!isAuthenticated}
      onAuthOpen={() => {
        setAuthTab("login");
        setShowAuthModal(true);
      }}
      fullWidthChildren={true}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            ← Back
          </button>
        </div>

        {loading || !trip ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                <div className="relative">
                  <img
                    src={images?.[activeImage] || "https://placehold.co/1200x700?text=Trip+Image"}
                    alt={trip.title}
                    className="w-full h-[320px] md:h-[420px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
                        {trip.categoryName || "Trip"}
                      </p>
                      <h1 className="text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2">
                        {trip.title}
                      </h1>
                      <p className="text-white/85 text-sm mt-1">
                        {trip.origin} → {trip.destination}
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-slate-800">
                      {trip.status}
                    </span>
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto border-t border-slate-100">
                    {images.map((img, idx) => (
                      <button key={`${img}-${idx}`} onClick={() => setActiveImage(idx)}>
                        <img
                          src={img}
                          alt={`Trip ${idx + 1}`}
                          className={`w-20 h-20 rounded-2xl object-cover border-2 ${
                            activeImage === idx ? "border-[#00ab42]" : "border-transparent"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FactCard label="Price" value={`$${trip.pricePerSeat}/seat`} />
                <FactCard label="Departure" value={new Date(trip.departureTime).toLocaleString()} />
                <FactCard label="Seats" value={`${trip.availableSeats}/${trip.totalSeats}`} />
              </div>

              {/* Description */}
              <Section title="About this trip">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{trip.description}</p>
              </Section>

              {/* Vehicle & pricing */}
              <Section title="Vehicle & pricing">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <InfoRow label="Transportation type" value={trip.transportationType || "—"} />
                  <InfoRow label="Vehicle capacity" value={trip.vehicleCapacity !== undefined ? String(trip.vehicleCapacity) : "—"} />
                  <InfoRow label="Whole vehicle booking" value={trip.isWholeVehicleBooking ? "Yes" : "No"} />
                  <InfoRow label="Whole vehicle price" value={trip.wholeVehiclePrice !== undefined ? `$${trip.wholeVehiclePrice}` : "—"} />
                </div>

                {vehicleImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-black text-slate-900 mb-2">Vehicle photos</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {vehicleImages.map((url, idx) => (
                        <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`vehicle-${idx + 1}`} className="w-full h-24 rounded-2xl object-cover border hover:opacity-90" />
                        </a>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Vehicle interior/exterior images uploaded by the driver.</p>
                  </div>
                )}
              </Section>

              {/* Schedule */}
              <Section title="Schedule">
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Schedule:</span>{" "}
                    {trip.scheduleDescription || "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Availability:</span>{" "}
                    {trip.availabilitySchedule || "—"}
                  </p>
                </div>
              </Section>

              {/* Optional services */}
              {(trip.hasTourGuide || trip.mealsIncluded) && (
                <Section title="Optional services">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tour guide</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{trip.hasTourGuide ? "Included" : "Not included"}</p>
                      {trip.hasTourGuide && (
                        <>
                          <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{trip.tourGuideDescription || "—"}</p>
                          {trip.tourGuideImageUrl && (
                            <img
                              src={trip.tourGuideImageUrl}
                              alt="Tour guide"
                              className="mt-3 w-full h-40 object-cover rounded-2xl border"
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Meals</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{trip.mealsIncluded ? "Included" : "Not included"}</p>
                      {trip.mealsIncluded && (
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{trip.diningDetails || "—"}</p>
                      )}
                    </div>
                  </div>
                </Section>
              )}

              {/* Itinerary */}
              {(trip.itinerary || []).length > 0 && (
                <Section title="Itinerary">
                  <div className="space-y-3">
                    {(trip.itinerary || []).map((s, idx) => (
                      <div key={s.id ?? idx} className="bg-white border border-slate-200 rounded-2xl p-4">
                        <div className="flex gap-4">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt={s.name} className="w-20 h-20 rounded-2xl object-cover border" />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 border flex items-center justify-center text-slate-400 text-xs">No image</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Stop {idx + 1}</p>
                            <p className="text-lg font-black text-slate-900 leading-tight">
                              {s.name || `Stop #${idx + 1}`}
                            </p>
                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{s.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Right: booking card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Book now</p>
                <p className="text-2xl font-black text-slate-900 mt-2">${trip.pricePerSeat} <span className="text-sm text-slate-500 font-bold">/ seat</span></p>
                <p className="text-sm text-slate-500 mt-1">Driver: <span className="font-bold text-slate-700">{trip.driverName || "Unknown"}</span></p>

                <div className="mt-5">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Seats</label>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, Number(trip.availableSeats || 1))}
                    value={seatsBooked}
                    onChange={(e) => setSeatsBooked(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">Available: {trip.availableSeats} seat(s)</p>
                </div>

                <button
                  onClick={handleCreateBooking}
                  disabled={bookingLoading || Number(trip.availableSeats) <= 0}
                  className="mt-5 w-full px-6 py-4 rounded-2xl bg-[#00eb5b] text-slate-900 font-black hover:bg-[#00ab42] hover:text-white disabled:opacity-50 transition-colors"
                >
                  {bookingLoading
                    ? "Booking..."
                    : Number(trip.availableSeats) <= 0
                      ? "No seats available"
                      : "Book this trip"}
                </button>

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setShowAuthModal(true);
                    }}
                    className="mt-3 w-full px-6 py-3 rounded-2xl border border-slate-200 bg-white font-black text-slate-700 hover:bg-slate-50"
                  >
                    Sign in to book
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-emerald-900/20 p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to Soksabay Go</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Login or register to book</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
              <button
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-bold ${
                  authTab === "login" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-bold ${
                  authTab === "register" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
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
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 disabled:opacity-50"
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
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 disabled:opacity-50"
                >
                  {authLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">or continue with</span>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50/40 text-slate-700 font-bold flex items-center justify-center gap-3"
            >
              <span className="w-5 h-5">G</span>
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6">
    <h2 className="text-lg font-black text-slate-900 mb-3">{title}</h2>
    {children}
  </div>
);

const FactCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5">
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-sm font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-900 mt-1 break-words">{value}</p>
  </div>
);

export default TripDetail;
