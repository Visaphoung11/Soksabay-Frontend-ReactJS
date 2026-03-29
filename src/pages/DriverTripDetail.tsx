import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { getDriverTripById } from "../services/driverService";
import type { Trip } from "../types/auth";

const DriverTripDetail: React.FC = () => {
  const { id } = useParams();
  const tripId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const images = useMemo(() => trip?.images || [], [trip]);
  const vehicleImages = useMemo(() => trip?.vehicleImageUrls || [], [trip]);

  useEffect(() => {
    if (!tripId || Number.isNaN(tripId)) {
      toast.error("Invalid trip id");
      navigate("/driver/trips", { replace: true });
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const detail = await getDriverTripById(tripId);
        setTrip(detail);
        setActiveImage(0);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load trip details");
        navigate("/driver/trips", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [tripId]);

  return (
    <AppLayout
      title={trip ? trip.title : "Trip Details"}
      subtitle={trip ? `${trip.origin} → ${trip.destination}` : "Loading..."}
      fullWidthChildren={true}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            ← Back
          </button>
          {trip && (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white">
              {trip.status}
            </span>
          )}
        </div>

        {loading || !trip ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                <div className="relative">
                  <img
                    src={images?.[activeImage] || "https://placehold.co/1200x700?text=Trip+Image"}
                    alt={trip.title}
                    className="w-full h-[320px] md:h-[420px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
                      {trip.categoryName || "Trip"}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                      {trip.title}
                    </h1>
                    <p className="text-white/85 text-sm mt-1">
                      {trip.origin} → {trip.destination}
                    </p>
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

              <Section title="Overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <InfoRow label="Departure" value={new Date(trip.departureTime).toLocaleString()} />
                  <InfoRow label="Seats" value={`${trip.availableSeats}/${trip.totalSeats}`} />
                  <InfoRow label="Price per seat" value={`$${trip.pricePerSeat}`} />
                  <InfoRow label="Driver" value={trip.driverName || "—"} />
                </div>
              </Section>

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
                    <p className="text-[11px] text-slate-500 mt-2">Vehicle interior/exterior images (only visible for your trip).</p>
                  </div>
                )}
              </Section>

              <Section title="Schedule">
                <div className="space-y-2 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-800">Schedule:</span> {trip.scheduleDescription || "—"}</p>
                  <p><span className="font-semibold text-slate-800">Availability:</span> {trip.availabilitySchedule || "—"}</p>
                </div>
              </Section>

              <Section title="Description">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{trip.description}</p>
              </Section>

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
                            <img src={trip.tourGuideImageUrl} alt="Guide" className="mt-3 w-full h-40 object-cover rounded-2xl border" />
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
                            <p className="text-lg font-black text-slate-900 leading-tight">{s.name || `Stop #${idx + 1}`}</p>
                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{s.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your trip</p>
                <p className="text-2xl font-black text-slate-900 mt-2">${trip.pricePerSeat} <span className="text-sm text-slate-500 font-bold">/ seat</span></p>
                <p className="text-sm text-slate-500 mt-1">Seats: <span className="font-bold text-slate-700">{trip.availableSeats}/{trip.totalSeats}</span></p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/driver/trips")}
                    className="w-full px-6 py-3 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800"
                  >
                    Back to My Trips
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6">
    <h2 className="text-lg font-black text-slate-900 mb-3">{title}</h2>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-900 mt-1 break-words">{value}</p>
  </div>
);

export default DriverTripDetail;
