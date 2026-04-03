
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { createBooking, getMyBookings, getPublicTripById, uploadMultipleImages } from "../services/driverService";
import { createReview, getReviewsByTrip } from "../services/reviewService";
import type { CreateReviewPayload, Review, TravelerType, Trip } from "../types/auth";
import { GoogleIcon, SectionTitle } from "../components/common";
import TripHero from "../components/trip/TripHero";
import TripQuickFacts from "../components/trip/TripQuickFacts";
import TripBookingCard from "../components/trip/TripBookingCard";
import TripItinerary from "../components/trip/TripItinerary";
import TripReviews from "../components/trip/TripReviews";

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

  // auth modal
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

  // reviews
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsError, setReviewsError] = useState<string>("");
  const [canReview, setCanReview] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTravelerType, setReviewTravelerType] = useState<TravelerType>("COUPLES");
  const [reviewVisitDate, setReviewVisitDate] = useState("");
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);

  // itinerary accordion (FAQ-style drop-down with smooth animation)
  const [openItineraries, setOpenItineraries] = useState<Set<number>>(new Set());

  // Memoized images are no longer needed here

  // Compute average rating from loaded reviews (TripAdvisor-style)
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

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
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || "Failed to load trip details");
        navigate("/trips", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tripId, navigate]);

  useEffect(() => {
    if (!tripId || Number.isNaN(tripId)) return;
    const run = async () => {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const list = await getReviewsByTrip(tripId);
        setReviews(list);
      } catch (err: unknown) {
        const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        if (error?.response?.status === 401) {
          setReviewsError("Reviews are not public yet. (Backend requires token for this endpoint)");
        } else {
          const msg = error?.response?.data?.message || error?.message || "Failed to load reviews";
          setReviewsError(msg);
        }
      } finally {
        setReviewsLoading(false);
      }
    };
    run();
  }, [tripId]);

  useEffect(() => {
    if (!isAuthenticated || !tripId || Number.isNaN(tripId)) {
      setCanReview(false);
      return;
    }
    const run = async () => {
      try {
        const bookings = await getMyBookings();
        const ok = bookings.some((b) => b?.trip?.id === tripId && b.status === "CONFIRMED");
        setCanReview(ok);
      } catch {
        setCanReview(false);
      }
    };
    run();
  }, [isAuthenticated, tripId]);

  const toggleItinerary = (index: number) => {
    setOpenItineraries((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handlePickReviewFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextFiles = Array.from(e.target.files || []);
    if (!nextFiles.length) return;
    const oversized = nextFiles.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      toast.error(`Image too large: ${oversized.name}. Max size is 10MB.`);
      e.target.value = "";
      return;
    }
    setReviewFiles((prev) => {
      const merged = [...prev, ...nextFiles];
      const deduped = merged.filter(
        (file, index, arr) =>
          arr.findIndex(
            (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
          ) === index
      );
      return deduped;
    });
    e.target.value = "";
  };

  const submitReview = async () => {
    if (!trip) return;
    if (!isAuthenticated) {
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    if (!canReview) {
      toast.error("You can only review after a CONFIRMED booking for this trip.");
      return;
    }
    const rating = Number(reviewRating);
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }
    if (!reviewTitle.trim()) {
      toast.error("Please enter a review title.");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please enter your review comment.");
      return;
    }
    if (!reviewVisitDate.trim()) {
      toast.error("Please enter your visit date (e.g., March 2026). ");
      return;
    }
    setReviewSubmitting(true);
    try {
      const uploadedUrls = reviewFiles.length ? await uploadMultipleImages(reviewFiles) : [];
      const payload: CreateReviewPayload = {
        tripId: trip.id,
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        travelerType: reviewTravelerType,
        visitDate: reviewVisitDate.trim(),
        imageUrls: uploadedUrls,
      };
      const created = await createReview(payload as CreateReviewPayload);
      toast.success("Review submitted");
      // optimistic update
      setReviews((prev) => [created, ...prev]);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setReviewTravelerType("COUPLES");
      setReviewVisitDate("");
      setReviewFiles([]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to create booking");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAuthError(error?.response?.data?.message || "Registration failed");
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
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to trips
          </button>
        </div>

        {loading || !trip ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-lg">
            Loading details...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN – Main content */}
            <div className="lg:col-span-2 space-y-8">
              <TripHero
                trip={trip}
                activeImage={activeImage}
                onSelectImage={setActiveImage}
                averageRating={averageRating}
                reviewsCount={reviews.length}
              />

              <TripQuickFacts trip={trip} />

              {/* ABOUT */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8">
                <SectionTitle icon="★">About this trip</SectionTitle>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[15.5px]">
                  {trip.description}
                </p>
              </div>

              {/* VEHICLE & PRICING */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6">Vehicle &amp; Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Transportation</span>
                    <p className="font-semibold text-slate-900 mt-1">{trip.transportationType || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Vehicle capacity</span>
                    <p className="font-semibold text-slate-900 mt-1">{trip.vehicleCapacity ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Whole vehicle booking</span>
                    <p className="font-semibold text-slate-900 mt-1">{trip.isWholeVehicleBooking ? "✅ Yes" : "No"}</p>
                  </div>
                  {trip.wholeVehiclePrice && (
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Whole vehicle price</span>
                      <p className="font-semibold text-slate-900 mt-1">${trip.wholeVehiclePrice}</p>
                    </div>
                  )}
                </div>

                {trip.vehicleImageUrls && trip.vehicleImageUrls.length > 0 && (
                  <div className="mt-10">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Vehicle photos by driver</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {trip.vehicleImageUrls.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={url}
                            alt={`Vehicle ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-3xl border border-slate-100 hover:border-[#00ab42] transition-colors"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* OPTIONAL SERVICES */}
              {(trip.hasTourGuide || trip.mealsIncluded) && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8">
                  <h2 className="text-xl font-black text-slate-900 mb-6">Included services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trip.hasTourGuide && (
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <span className="text-2xl">🧭</span>
                          <p className="font-black">Tour guide included</p>
                        </div>
                        {trip.tourGuideDescription && <p className="mt-3 text-slate-600">{trip.tourGuideDescription}</p>}
                        {trip.tourGuideImageUrl && (
                          <img src={trip.tourGuideImageUrl} alt="Tour guide" className="mt-6 w-full h-48 object-cover rounded-3xl" />
                        )}
                      </div>
                    )}
                    {trip.mealsIncluded && (
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <span className="text-2xl">🍽️</span>
                          <p className="font-black">Meals included</p>
                        </div>
                        {trip.diningDetails && <p className="mt-3 text-slate-600">{trip.diningDetails}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <TripItinerary
                itinerary={trip.itinerary}
                openItineraries={openItineraries}
                toggleItinerary={toggleItinerary}
              />

              <TripReviews
                reviews={reviews}
                reviewsLoading={reviewsLoading}
                reviewsError={reviewsError}
                isAuthenticated={isAuthenticated}
                canReview={canReview}
                averageRating={averageRating}
                onAuthOpen={() => {
                  setAuthTab("login");
                  setShowAuthModal(true);
                }}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                reviewTravelerType={reviewTravelerType}
                setReviewTravelerType={setReviewTravelerType}
                reviewVisitDate={reviewVisitDate}
                setReviewVisitDate={setReviewVisitDate}
                reviewTitle={reviewTitle}
                setReviewTitle={setReviewTitle}
                reviewComment={reviewComment}
                setReviewComment={setReviewComment}
                reviewFiles={reviewFiles}
                onPickFiles={handlePickReviewFiles}
                onRemoveFile={(idx) => setReviewFiles((prev) => prev.filter((_, i) => i !== idx))}
                onSubmitReview={submitReview}
                reviewSubmitting={reviewSubmitting}
              />
            </div>

            <div className="lg:col-span-1">
              <TripBookingCard
                trip={trip}
                seatsBooked={seatsBooked}
                onSeatsChange={setSeatsBooked}
                onBook={handleCreateBooking}
                loading={bookingLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* AUTH MODAL – unchanged */}
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
                className={`flex-1 py-2 text-sm rounded-xl font-bold ${authTab === "login" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-sm rounded-xl font-bold ${authTab === "register" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
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
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">or continue with</span>
            </div>
            <button
              onClick={() => loginWithGoogle()}
              className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50/40 text-slate-700 font-bold flex items-center justify-center gap-3"
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

export default TripDetail;