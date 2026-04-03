import React from "react";
import type { Trip } from "../../types/auth";

interface DriverTripCardProps {
    trip: Trip;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onDetail: (id: number) => void;
}

const DriverTripCard: React.FC<DriverTripCardProps> = ({
    trip,
    onEdit,
    onDelete,
    onDetail,
}) => {
    return (
        <div key={trip.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
            <div className="relative h-48 group">
                <img
                    src={trip.images?.[0] || "https://placehold.co/800x500?text=Trip+Image"}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => onDetail(trip.id)} className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-xs">View detail</button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 truncate flex-1 mr-2">{trip.title}</h3>
                    <span className="text-[#00ab42] font-black text-sm">${trip.pricePerSeat}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{trip.origin} → {trip.destination}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                    <span>{new Date(trip.departureTime).toLocaleDateString()}</span>
                    <span>{trip.availableSeats}/{trip.totalSeats} seats left</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(trip.id)}
                        className="flex-1 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(trip.id)}
                        className="px-3 py-2 border border-red-100 text-red-600 rounded-xl hover:bg-red-50"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverTripCard;
