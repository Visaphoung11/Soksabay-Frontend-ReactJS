import React from "react";
import type { Trip } from "../../types/auth";

interface TripBookingCardProps {
    trip: Trip;
    seatsBooked: number;
    onSeatsChange: (seats: number) => void;
    onBook: () => void;
    loading: boolean;
}

const TripBookingCard: React.FC<TripBookingCardProps> = ({
    trip,
    seatsBooked,
    onSeatsChange,
    onBook,
    loading,
}) => {
    return (
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
                    onChange={(e) => onSeatsChange(Number(e.target.value))}
                    className="w-full px-6 py-5 text-4xl font-black rounded-3xl border border-slate-200 focus:border-[#00eb5b] outline-none transition-colors"
                />
                <p className="mt-2 text-xs text-slate-400">{trip.availableSeats} seats remaining</p>
            </div>

            <button
                onClick={onBook}
                disabled={loading || Number(trip.availableSeats) <= 0}
                className="mt-8 w-full py-6 text-lg font-black bg-[#00eb5b] hover:bg-[#00ab42] text-slate-900 rounded-3xl transition-all disabled:opacity-40"
            >
                {loading ? "Booking..." : trip.availableSeats && trip.availableSeats > 0 ? "Book now" : "Sold out"}
            </button>
        </div>
    );
};

export default TripBookingCard;
