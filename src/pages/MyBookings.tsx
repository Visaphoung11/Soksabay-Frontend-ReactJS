import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { getMyBookings } from "../services/driverService";
import type { Booking } from "../types/auth";

const statusClass = (status: Booking["status"]) => {
  if (status === "CONFIRMED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const MyBookings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <AppLayout title="My Bookings" subtitle="Track your booking status from pending to confirmed/rejected">
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-slate-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500">No bookings yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-b border-slate-100">
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 text-blue-700 font-black text-xs flex items-center justify-center shadow">
                    SG
                  </div>
                  <div className="pl-12 pr-2">
                    <h3 className="text-base font-black text-slate-900 line-clamp-2">{booking.trip?.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">Destination: {booking.trip?.destination}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${statusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="p-4 space-y-2 text-sm text-slate-600">
                  <p><span className="font-semibold">Driver:</span> {booking.trip?.driverName}</p>
                  <p><span className="font-semibold">Departure:</span> {new Date(booking.trip?.departureTime).toLocaleString()}</p>
                  <p><span className="font-semibold">Seats booked:</span> {booking.seatsBooked}</p>
                  <p><span className="font-semibold">Total price:</span> ${booking.totalPrice}</p>
                  <p className="text-xs text-slate-500"><span className="font-semibold">Booked at:</span> {new Date(booking.createdAt).toLocaleString()}</p>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      {booking.status === "PENDING" && "Waiting for driver response..."}
                      {booking.status === "CONFIRMED" && "Driver accepted your booking ✅"}
                      {booking.status === "REJECTED" && (
                        <div className="flex flex-col gap-1">
                          <span className="text-red-600 font-bold">Driver rejected your booking ❌</span>
                          {booking.rejectionReason && (
                            <p className="p-2 rounded-xl bg-red-50 text-red-700 text-[11px] border border-red-100 italic">
                              Reason: {booking.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyBookings;
