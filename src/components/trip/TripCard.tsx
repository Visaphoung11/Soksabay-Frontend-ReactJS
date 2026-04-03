import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "../ui";

export interface Trip {
  id: number;
  title: string;
  description?: string;
  destination?: string;
  departureLocation?: string;
  price?: number;
  currency?: string;
  images?: string[];
  imageUrl?: string;
  driverId?: number;
  driverName?: string;
  driverProfileImage?: string;
  availableSeats?: number;
  totalSeats?: number;
  departureTime?: string;
  status?: string;
  createdAt?: string;
}

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  showDriver?: boolean;
  variant?: "default" | "compact" | "featured";
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onClick, showDriver = true, variant = "default" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/trips/${trip.id}`);
    }
  };

  const imageUrl = trip.imageUrl || trip.images?.[0] || "";

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="flex gap-3 p-3 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
      >
        {imageUrl && (
          <img src={imageUrl} alt={trip.title} className="w-20 h-20 rounded-xl object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900 truncate">{trip.title}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{trip.destination || trip.departureLocation}</p>
          {trip.price && (
            <p className="text-sm font-black text-emerald-600 mt-1">
              ${trip.price} {trip.currency || "USD"}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-300 hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        {trip.status && (
          <div className="absolute top-3 left-3">
            <Badge variant={trip.status === "ACTIVE" ? "success" : "default"}>
              {trip.status}
            </Badge>
          </div>
        )}

        {/* Price Badge */}
        {trip.price && (
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-black rounded-full">
              ${trip.price}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-black text-slate-900 text-lg leading-tight">{trip.title}</h3>
        
        {trip.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{trip.description}</p>
        )}

        {/* Location & Time */}
        <div className="mt-3 space-y-2">
          {trip.departureLocation && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{trip.departureLocation} → {trip.destination}</span>
            </div>
          )}
          
          {trip.departureTime && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{new Date(trip.departureTime).toLocaleString()}</span>
            </div>
          )}

          {trip.availableSeats !== undefined && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{trip.availableSeats} / {trip.totalSeats} seats available</span>
            </div>
          )}
        </div>

        {/* Driver Info */}
        {showDriver && (trip.driverName || trip.driverProfileImage) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 overflow-hidden flex items-center justify-center">
              {trip.driverProfileImage ? (
                <img src={trip.driverProfileImage} alt={trip.driverName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-600 font-black text-sm">
                  {(trip.driverName || "D").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{trip.driverName || "Driver"}</p>
              <p className="text-xs text-slate-500">Trip Driver</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============== Trip List ==============
interface TripListProps {
  trips: Trip[];
  loading?: boolean;
  emptyMessage?: string;
  onTripClick?: (trip: Trip) => void;
  showDriver?: boolean;
}

export const TripList: React.FC<TripListProps> = ({
  trips,
  loading = false,
  emptyMessage = "No trips found",
  onTripClick,
  showDriver = true
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden animate-pulse">
            <div className="h-48 bg-slate-200" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="mt-4 text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onClick={() => onTripClick?.(trip)}
          showDriver={showDriver}
        />
      ))}
    </div>
  );
};

// ============== Trip Filters ==============
export interface TripFilters {
  search?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  sortBy?: "date" | "price" | "popular";
}

interface TripFilterBarProps {
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
}

export const TripFilterBar: React.FC<TripFilterBarProps> = ({ filters, onChange }) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <input
      type="text"
      placeholder="Search trips..."
      value={filters.search || ""}
      onChange={(e) => onChange({ ...filters, search: e.target.value })}
      className="flex-1 min-w-[200px] px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-emerald-400 outline-none"
    />
    <input
      type="text"
      placeholder="Destination"
      value={filters.destination || ""}
      onChange={(e) => onChange({ ...filters, destination: e.target.value })}
      className="w-40 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-emerald-400 outline-none"
    />
    <input
      type="date"
      value={filters.date || ""}
      onChange={(e) => onChange({ ...filters, date: e.target.value })}
      className="px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-emerald-400 outline-none"
    />
    <select
      value={filters.sortBy || "date"}
      onChange={(e) => onChange({ ...filters, sortBy: e.target.value as TripFilters["sortBy"] })}
      className="px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-emerald-400 outline-none bg-white"
    >
      <option value="date">Sort by Date</option>
      <option value="price">Sort by Price</option>
      <option value="popular">Sort by Popular</option>
    </select>
  </div>
);