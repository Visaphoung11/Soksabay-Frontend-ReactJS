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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

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
    if (accept) {
      const ok = confirm(
        "Accepting this booking will automatically close any of your other available trips within a 4-hour window to prevent overbooking. Continue?"
      );
      if (!ok) return;

      setRespondingId(id);
      try {
        await respondDriverBooking(id, true);
        toast.success("Booking confirmed");
        await loadRequests();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to respond booking");
      } finally {
        setRespondingId(null);
      }
    } else {
      setSelectedBookingId(id);
      setRejectionReason("");
      setShowRejectModal(true);
    }
  };

  const submitRejection = async () => {
    if (!selectedBookingId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRespondingId(selectedBookingId);
    try {
      await respondDriverBooking(selectedBookingId, false, rejectionReason);
      toast.success("Booking rejected");
      setShowRejectModal(false);
      await loadRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject booking");
    } finally {
      setRespondingId(null);
      setSelectedBookingId(null);
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit uppercase tracking-tight">Reject Booking</h3>
              <p className="text-slate-500 text-sm mb-6">Please provide a reason for rejecting this booking. This will be shared with the passenger.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Vehicle maintenance, Fully booked..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#00ab42] focus:ring-4 focus:ring-[#00ab42]/5 transition-all outline-none text-slate-700 text-sm min-h-[100px] resize-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={respondingId !== null}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  disabled={respondingId !== null || !rejectionReason.trim()}
                  className="flex-2 px-6 py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                >
                  {respondingId !== null ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default DriverBookingRequests;
