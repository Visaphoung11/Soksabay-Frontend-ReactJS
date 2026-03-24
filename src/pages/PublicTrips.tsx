import React, { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types/auth";
import { getPublicTripById, searchPublicTrips } from "../services/driverService";
import AppLayout from "../components/AppLayout";

const PublicTrips: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeImage, setActiveImage] = useState(0);

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
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load trip details");
    }
  };

  return (
    <AppLayout title="Explore Trips" subtitle="Search available trips with advanced filters">
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
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default PublicTrips;
