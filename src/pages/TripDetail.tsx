import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { createBooking, getMyBookings, getPublicTripById, uploadMultipleImages } from "../services/driverService";
import { createReview, getReviewsByTrip } from "../services/reviewService";
import type { CreateReviewPayload, Review, TravelerType, Trip } from "../types/auth";

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

  useEffect(() => {
    if (!tripId || Number.isNaN(tripId)) return;

    const run = async () => {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const list = await getReviewsByTrip(tripId);
        setReviews(list);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Failed to load reviews";
        setReviewsError(msg);
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

              {/* Reviews */}
              <Section title="Reviews">
                <div className="space-y-4">
                  {reviewsError && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm">
                      <p className="font-black">Reviews temporarily unavailable</p>
                      <p className="text-xs mt-1">{reviewsError}</p>
                    </div>
                  )}
                  {reviewsLoading ? (
                    <p className="text-sm text-slate-500">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-slate-500">No reviews yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <ReviewCard key={r.id} review={r} />
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-black text-slate-900">Write a review</p>
                        <p className="text-xs text-slate-500">Verified reviews only (CONFIRMED booking required).</p>
                      </div>
                      {!isAuthenticated ? (
                        <button
                          onClick={() => {
                            setAuthTab("login");
                            setShowAuthModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider"
                        >
                          Sign in to review
                        </button>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${canReview ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                          {canReview ? "Verified" : "Not eligible"}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Rating (1-5)</label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const v = i + 1;
                            const active = v === reviewRating;
                            return (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setReviewRating(v)}
                                className={`w-9 h-9 rounded-full border text-sm font-black ${active ? "bg-[#00eb5b] border-[#00eb5b] text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                              >
                                {v}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Traveler type</label>
                        <select
                          value={reviewTravelerType}
                          onChange={(e) => setReviewTravelerType(e.target.value as TravelerType)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white"
                        >
                          <option value="BUSINESS">Business</option>
                          <option value="COUPLES">Couples</option>
                          <option value="FAMILY">Family</option>
                          <option value="FRIENDS">Friends</option>
                          <option value="SOLO">Solo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Visit date</label>
                        <input
                          value={reviewVisitDate}
                          onChange={(e) => setReviewVisitDate(e.target.value)}
                          placeholder="March 2026"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                        <input
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Amazing scenic drive!"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Comment</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Had a wonderful time..."
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 min-h-28"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Add photos</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePickReviewFiles}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white"
                        />
                        {reviewFiles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {reviewFiles.map((f, idx) => (
                              <div key={`${f.name}-${idx}`} className="px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center gap-2">
                                <span className="truncate max-w-[220px]" title={f.name}>{f.name}</span>
                                <button type="button" onClick={() => setReviewFiles((prev) => prev.filter((_, i) => i !== idx))} className="text-red-600 font-black">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={!isAuthenticated || !canReview || reviewSubmitting}
                      className="mt-4 px-6 py-3 rounded-2xl bg-[#00eb5b] text-slate-900 font-black hover:bg-[#00ab42] hover:text-white disabled:opacity-50"
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit review"}
                    </button>
                    {!isAuthenticated ? (
                      <p className="text-xs text-slate-500 mt-2">Sign in to submit a review.</p>
                    ) : !canReview ? (
                      <p className="text-xs text-amber-700 mt-2">You need a CONFIRMED booking for this trip to review.</p>
                    ) : null}
                  </div>
                </div>
              </Section>
            </div>

            {/* Right: booking card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Book now</p>
                <p className="text-2xl font-black text-slate-900 mt-2">${trip.pricePerSeat} <span className="text-sm text-slate-500 font-bold">/ seat</span></p>
                <p className="text-sm text-slate-500 mt-1">
                  Driver:{" "}
                  <span className="font-bold text-slate-700">{trip.driverName || "Unknown"}</span>
                  {trip.driverId ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/drivers/${trip.driverId}`)}
                      className="ml-2 text-xs font-black text-[#00ab42] hover:underline"
                    >
                      View profile
                    </button>
                  ) : null}
                </p>

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

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-[#00eb5b]/15 border border-[#00eb5b]/20 overflow-hidden flex items-center justify-center shrink-0">
          {review.userProfileImage ? (
            <img src={review.userProfileImage} alt={review.userFullName || "Reviewer"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#00ab42] font-black text-xs">
              {(review.userFullName || "U").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900 truncate">
            {review.userFullName || "Traveler"}
          </p>
          <p className="text-[11px] text-slate-500">
            {review.travelerType ? <span>{review.travelerType}</span> : null}
            {review.visitDate ? <span> • Visited {review.visitDate}</span> : null}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="inline-flex items-center gap-2">
          <ScorePill score={review.rating} />
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
            Verified
          </span>
        </div>
        {review.createdAt && (
          <p className="text-[11px] text-slate-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>

    <div className="mt-4">
      <p className="text-base font-black text-slate-900">{review.title}</p>
      <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{review.comment}</p>
    </div>

    {review.imageUrls?.length > 0 && (
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {review.imageUrls.map((url, idx) => (
          <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={`review-${idx + 1}`} className="w-full h-28 rounded-2xl object-cover border hover:opacity-90" />
          </a>
        ))}
      </div>
    )}
  </div>
);

const ScorePill = ({ score }: { score: number }) => {
  const s = Math.max(1, Math.min(5, Number(score) || 1));
  const tone = s >= 5 ? "bg-emerald-600" : s >= 4 ? "bg-lime-600" : s >= 3 ? "bg-amber-600" : "bg-red-600";
  return (
    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black text-white ${tone}`}>
      {s}/5
    </span>
  );
};

export default TripDetail;
