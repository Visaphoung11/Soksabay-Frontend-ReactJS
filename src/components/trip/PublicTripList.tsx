import React from "react";
import type { Trip } from "../../types/auth";

interface PublicTripListProps {
    loading: boolean;
    trips: Trip[];
    error: string;
    onTripClick: (id: number) => void;
}

const Star = ({ className = "" }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.81c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
);

const HalfStar = () => (
    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 20 20" aria-hidden>
        <defs>
            <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e2e8f0" />
            </linearGradient>
        </defs>
        <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.81c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
);

const TripRatingSummary = ({
    avg,
    count,
    unavailable = false,
}: {
    avg: number;
    count: number;
    unavailable?: boolean;
}) => {
    if (unavailable) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500">Rating unavailable</span>
            </div>
        );
    }

    const clamped = Math.max(0, Math.min(5, Number(avg) || 0));
    const stars = Math.round(clamped * 10) / 10;
    const fullStars = Math.floor(stars);
    const hasHalf = stars - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <Star key={`f-${i}`} />
                ))}
                {hasHalf ? <HalfStar /> : null}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <Star key={`e-${i}`} className="text-slate-200" />
                ))}
            </div>
            <span className="text-xs font-black text-slate-700">
                {count > 0 ? `${clamped.toFixed(1)}/5` : "New"}
            </span>
            <span className="text-xs text-slate-500">({count})</span>
        </div>
    );
};

const PublicTripList: React.FC<PublicTripListProps> = ({
    loading,
    trips,
    error,
    onTripClick,
}) => {
    if (error) {
        return (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                aria-label="Loading trips"
            >
                {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse"
                    >
                        <div className="w-full h-52 bg-slate-200" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                            <div className="h-3 bg-slate-200 rounded w-full" />
                            <div className="h-3 bg-slate-200 rounded w-5/6" />
                            <div className="flex items-center justify-between pt-1">
                                <div className="h-4 bg-slate-200 rounded w-24" />
                                <div className="h-4 bg-slate-200 rounded w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="py-20 text-center text-slate-500">
                No trips found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
                <button
                    key={trip.id}
                    onClick={() => onTripClick(trip.id)}
                    className="text-left bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="relative">
                        <img
                            src={
                                trip.images?.[0] ||
                                "https://placehold.co/800x500?text=Trip+Image"
                            }
                            alt={trip.title}
                            className="w-full h-52 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/90 text-[#00ab42] font-black text-xs flex items-center justify-center shadow-lg">
                                SG
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-slate-700">
                                Verified Driver
                            </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="font-black text-white text-lg leading-tight line-clamp-1">
                                    {trip.title}
                                </h3>
                                <p className="text-white/80 text-xs line-clamp-1">
                                    {trip.origin} → {trip.destination}
                                </p>
                            </div>
                            <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#00eb5b] text-slate-900">
                                {trip.categoryName || "Trip"}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <TripRatingSummary
                                avg={trip.averageRating ?? 0}
                                count={trip.totalReviews ?? 0}
                                unavailable={false}
                            />
                            <span className="text-xs text-slate-500 font-semibold">
                                {new Date(trip.departureTime).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                            {trip.description ||
                                "No description provided for this trip."}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#00ab42] font-black text-base">
                                ${trip.pricePerSeat}/seat
                            </span>
                            <span className="text-slate-500 font-semibold">
                                {trip.availableSeats}/{trip.totalSeats} seats
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Driver: {trip.driverName || "Unknown"}</span>
                            <span className="font-semibold">View details →</span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default PublicTripList;
