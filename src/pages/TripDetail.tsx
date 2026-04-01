
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { createBooking, getMyBookings, getPublicTripById, uploadMultipleImages } from "../services/driverService";
import { createReview, getReviewsByTrip } from "../services/reviewService";
import type { CreateReviewPayload, Review, TravelerType, Trip } from "../types/auth";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const StarRating = ({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
  const starSize = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl";
  const fullStars = Math.floor(rating);
  const hasPartial = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <span key={i} className={`${starSize} text-yellow-400`}>★</span>;
        }
        if (i === fullStars && hasPartial) {
          return (
            <span key={i} className={`${starSize} text-yellow-400 relative`}>
              ★
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                ★
              </span>
            </span>
          );
        }
        return <span key={i} className={`${starSize} text-slate-200`}>★</span>;
      })}
    </div>
  );
};

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

  const images = useMemo(() => trip?.images || [], [trip]);
  const vehicleImages = useMemo(() => trip?.vehicleImageUrls || [], [trip]);

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
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load trip details");
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
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setReviewsError("Reviews are not public yet. (Backend requires token for this endpoint)");
        } else {
          const msg = err?.response?.data?.message || err?.message || "Failed to load reviews";
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit review";
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
            {/* LEFT COLUMN – Main TripAdvisor-style content */}
            <div className="lg:col-span-2 space-y-8">
              {/* HERO GALLERY – TripAdvisor header style */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="relative">
                  <img
                    src={images?.[activeImage] || "https://placehold.co/1200x700?text=Trip+Image"}
                    alt={trip.title}
                    className="w-full h-[380px] md:h-[460px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* TripAdvisor-style badge + rating overlay */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="px-4 py-1 bg-white/90 text-[#00ab42] text-xs font-black uppercase tracking-widest rounded-3xl inline-flex items-center gap-1 shadow">
                      {trip.categoryName || "TRIP"}
                    </div>
                    {averageRating > 0 && (
                      <div className="flex items-center gap-2 bg-white/95 text-slate-900 px-4 py-2 rounded-3xl shadow text-sm font-bold">
                        <StarRating rating={averageRating} size="sm" />
                        <span>{averageRating.toFixed(1)}</span>
                        <span className="text-slate-500 text-xs font-medium">({reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight drop-shadow-md">
                      {trip.title}
                    </h1>
                    <p className="text-white/90 text-lg mt-2 flex items-center gap-2">
                      {trip.origin} <span className="text-2xl">→</span> {trip.destination}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-white/80 text-sm">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-3xl text-xs font-black uppercase tracking-widest">
                        {trip.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="p-4 flex gap-3 overflow-x-auto border-t border-slate-100">
                    {images.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        onClick={() => setActiveImage(idx)}
                        className={`shrink-0 transition-all ${
                          activeImage === idx ? "ring-4 ring-[#00eb5b] scale-105" : ""
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Trip photo ${idx + 1}`}
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-transparent"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK FACTS – TripAdvisor highlight cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">From</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">${trip.pricePerSeat}</p>
                  <p className="text-sm text-slate-500">per seat</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Departure</p>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {new Date(trip.departureTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="text-sm text-slate-500">{new Date(trip.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Seats left</p>
                  <p className="text-4xl font-black text-emerald-600 mt-1">{trip.availableSeats}</p>
                  <p className="text-sm text-slate-500">of {trip.totalSeats}</p>
                </div>
              </div>

              {/* ABOUT */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8">
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-[#00ab42]">★</span> About this trip
                </h2>
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

                {vehicleImages.length > 0 && (
                  <div className="mt-10">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Vehicle photos by driver</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {vehicleImages.map((url, idx) => (
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

              {/* ITINERARY – FAQ-style accordion with drop-down animation */}
              {(trip.itinerary || []).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8">
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    Itinerary
                    <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 font-black rounded-3xl">Click each stop to expand</span>
                  </h2>

                  <div className="space-y-3">
                    {(trip.itinerary || []).map((stop, idx) => {
                      const isOpen = openItineraries.has(idx);
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-3xl overflow-hidden bg-white transition-all duration-300"
                        >
                          {/* Clickable header */}
                          <button
                            onClick={() => toggleItinerary(idx)}
                            className="w-full px-6 py-6 flex items-center justify-between text-left hover:bg-slate-50 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-2xl bg-[#00eb5b] text-white font-black flex items-center justify-center text-lg shrink-0">
                                {idx + 1}
                              </div>
                              <div className="text-left">
                                <p className="font-black text-lg text-slate-900 group-hover:text-[#00ab42]">
                                  {stop.name || `Stop ${idx + 1}`}
                                </p>
                                <p className="text-xs text-slate-400">Tap to see full details</p>
                              </div>
                            </div>

                            {/* Arrow with smooth rotation */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`w-6 h-6 transition-transform duration-300 text-slate-400 ${isOpen ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Drop-down content with animation */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? "max-h-[600px] opacity-100 pb-6" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="px-6">
                              {stop.imageUrl && (
                                <img
                                  src={stop.imageUrl}
                                  alt={stop.name}
                                  className="w-full rounded-3xl object-cover shadow-inner mb-6"
                                />
                              )}
                              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">
                                {stop.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* REVIEWS – Social-media-style feed (TripAdvisor + Instagram vibe) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Traveler Reviews</h2>
                    {averageRating > 0 && (
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center">
                          <StarRating rating={averageRating} size="lg" />
                        </div>
                        <div>
                          <p className="text-5xl font-black text-slate-900 leading-none">{averageRating.toFixed(1)}</p>
                          <p className="text-sm text-slate-400">{reviews.length} verified traveler reviews</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="px-5 py-2 bg-emerald-100 text-emerald-700 text-xs font-black rounded-3xl">VERIFIED BOOKINGS ONLY</span>
                  </div>
                </div>

                {reviewsError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-800 mb-8">
                    {reviewsError}
                  </div>
                )}

                {reviewsLoading ? (
                  <p className="text-slate-400 py-12 text-center">Loading traveler stories...</p>
                ) : reviews.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                    <p className="text-slate-400">No reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Social post header */}
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-3xl overflow-hidden bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shrink-0">
                              {review.userProfileImage ? (
                                <img src={review.userProfileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl text-emerald-600 font-black">
                                  {(review.userFullName || "T").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{review.userFullName || "Traveler"}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                {review.travelerType && <span className="capitalize">{review.travelerType.toLowerCase()}</span>}
                                {review.visitDate && <span>• Visited {review.visitDate}</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <StarRating rating={review.rating} size="sm" />
                            <div className="mt-1 px-3 py-px bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-3xl">✓ Verified</div>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>

                        {/* Review content – like a social media post */}
                        <div className="mt-6">
                          <p className="font-black text-xl text-slate-900">{review.title}</p>
                          <p className="mt-3 text-slate-600 leading-relaxed text-[15.5px] whitespace-pre-line">
                            {review.comment}
                          </p>
                        </div>

                        {/* Review photos – Instagram-style grid */}
                        {review.imageUrls && review.imageUrls.length > 0 && (
                          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {review.imageUrls.map((url, photoIdx) => (
                              <a
                                key={photoIdx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="block aspect-square rounded-3xl overflow-hidden border border-slate-100 hover:border-emerald-200 transition-colors"
                              >
                                <img src={url} alt={`Review photo ${photoIdx + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Social footer */}
                        <div className="mt-8 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-6">
                            <button className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                              👍 <span className="font-medium">Helpful</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                              💬 Reply
                            </button>
                          </div>
                          <span className="text-[10px]">Shared publicly • TripAdvisor-style</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* WRITE A REVIEW FORM – still visible and social-feeling */}
                <div className="mt-12 border-t border-slate-100 pt-10">
                  <h3 className="font-black text-xl text-slate-900 mb-2">Share your experience</h3>
                  <p className="text-sm text-slate-500 mb-6">Only verified passengers can post • Looks great on the feed!</p>

                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setAuthTab("login");
                        setShowAuthModal(true);
                      }}
                      className="w-full py-4 bg-slate-900 text-white font-black rounded-3xl text-sm uppercase tracking-widest"
                    >
                      Sign in to write a review
                    </button>
                  ) : !canReview ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center text-amber-700 text-sm">
                      You must have a CONFIRMED booking to leave a review.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Rating stars (TripAdvisor style) */}
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-3">Your rating</label>
                        <div className="flex gap-4">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const value = i + 1;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewRating(value)}
                                className={`text-5xl transition-transform hover:scale-110 ${
                                  value <= reviewRating ? "text-yellow-400" : "text-slate-200"
                                }`}
                              >
                                ★
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-400 mb-2">Traveler type</label>
                          <select
                            value={reviewTravelerType}
                            onChange={(e) => setReviewTravelerType(e.target.value as TravelerType)}
                            className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm"
                          >
                            <option value="SOLO">Solo traveler</option>
                            <option value="COUPLES">Couple</option>
                            <option value="FAMILY">Family</option>
                            <option value="FRIENDS">With friends</option>
                            <option value="BUSINESS">Business</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-400 mb-2">When did you travel?</label>
                          <input
                            type="text"
                            value={reviewVisitDate}
                            onChange={(e) => setReviewVisitDate(e.target.value)}
                            placeholder="March 2026"
                            className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Review title</label>
                        <input
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Unforgettable journey through the countryside!"
                          className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Your story</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={5}
                          placeholder="Tell everyone what you loved (or what could be better)..."
                          className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Add your photos (optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePickReviewFiles}
                          className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-3xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {reviewFiles.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {reviewFiles.map((file, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-3xl text-xs"
                              >
                                <span className="truncate max-w-52">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setReviewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="font-black text-red-500"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={submitReview}
                        disabled={reviewSubmitting}
                        className="w-full py-5 bg-[#00eb5b] hover:bg-[#00ab42] text-slate-900 font-black rounded-3xl text-lg transition-colors disabled:opacity-50"
                      >
                        {reviewSubmitting ? "Posting to the feed..." : "Post my review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – Sticky booking card (TripAdvisor style) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white border border-slate-200 rounded-3xl p-7 shadow-lg">
                <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  <span>Book this trip</span>
                  <span className="text-emerald-600">Instant confirmation</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-slate-900">${trip.pricePerSeat}</span>
                  <span className="text-slate-400 text-2xl font-medium">/seat</span>
                </div>

                <p className="text-sm mt-1 text-slate-500">
                  Driver:{" "}
                  <span className="font-semibold text-slate-700">{trip.driverName || "Unknown driver"}</span>
                </p>

                <div className="mt-8">
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">How many seats?</label>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, Number(trip.availableSeats || 1))}
                    value={seatsBooked}
                    onChange={(e) => setSeatsBooked(Number(e.target.value))}
                    className="w-full px-6 py-5 text-4xl font-black rounded-3xl border border-slate-200 focus:border-[#00eb5b] outline-none transition-colors"
                  />
                  <p className="mt-2 text-xs text-slate-400">{trip.availableSeats} seats remaining</p>
                </div>

                <button
                  onClick={handleCreateBooking}
                  disabled={bookingLoading || Number(trip.availableSeats) <= 0}
                  className="mt-8 w-full py-6 text-lg font-black bg-[#00eb5b] hover:bg-[#00ab42] text-slate-900 rounded-3xl transition-all disabled:opacity-40"
                >
                  {bookingLoading
                    ? "Reserving your seats..."
                    : Number(trip.availableSeats) <= 0
                      ? "Fully booked"
                      : "Reserve seats now"}
                </button>

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setShowAuthModal(true);
                    }}
                    className="mt-4 w-full py-4 text-slate-700 font-black border-2 border-slate-200 rounded-3xl hover:bg-slate-50"
                  >
                    Sign in to book
                  </button>
                )}

                <div className="mt-6 text-[10px] text-center text-slate-400">✓ Free cancellation up to 48h before departure</div>
              </div>
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