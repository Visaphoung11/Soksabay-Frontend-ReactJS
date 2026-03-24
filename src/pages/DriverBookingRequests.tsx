import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { getDriverBookingRequests, respondDriverBooking } from "../services/driverService";
import type { Booking } from "../types/auth";

const DriverBookingRequests: React.FC = () => {
  const { user } = useAuth();
  const isDriver = useMemo(() => user?.role?.some((r) => r.toUpperCase().includes("DRIVER")), [user]);
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [requests, setRequests] = useState<Booking[]>([]);

  const pendingRequests = requests
    .filter((booking) => booking.status === "PENDING")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getDriverBookingRequests();
      setRequests(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDriver) loadRequests();
  }, [isDriver]);

  const handleRespond = async (id: number, accept: boolean) => {
    setRespondingId(id);
    try {
      await respondDriverBooking(id, accept);
      toast.success(accept ? "Booking confirmed" : "Booking rejected");
      await loadRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to respond booking");
    } finally {
      setRespondingId(null);
    }
  };

  if (!isDriver) {
    return (
      <AppLayout title="Driver Booking Requests" subtitle="Driver access required">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
          You need <strong>ROLE_DRIVER</strong> to access booking requests.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Driver Booking Requests" subtitle="Review pending booking requests from passengers">
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-slate-500">Loading requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500">No pending booking requests.</div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((booking) => (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{booking.trip.title}</h3>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-100 text-amber-700">
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                  <p><span className="font-semibold">Passenger:</span> {booking.passengerName}</p>
                  <p><span className="font-semibold">Phone:</span> {booking.passengerPhone}</p>
                  <p><span className="font-semibold">Destination:</span> {booking.trip.destination}</p>
                  <p><span className="font-semibold">Departure:</span> {new Date(booking.trip.departureTime).toLocaleString()}</p>
                  <p><span className="font-semibold">Seats booked:</span> {booking.seatsBooked}</p>
                  <p><span className="font-semibold">Total price:</span> ${booking.totalPrice}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(booking.id, true)}
                    disabled={respondingId === booking.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {respondingId === booking.id ? "Processing..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleRespond(booking.id, false)}
                    disabled={respondingId === booking.id}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {respondingId === booking.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DriverBookingRequests;
