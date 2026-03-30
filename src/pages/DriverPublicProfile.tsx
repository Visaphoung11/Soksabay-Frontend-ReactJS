import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { getReviewsByDriver } from "../services/reviewService";
import type { Review } from "../types/auth";

const DriverPublicProfile: React.FC = () => {
  const { driverId } = useParams();
  const id = Number(driverId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      toast.error("Invalid driver id");
      navigate("/trips", { replace: true });
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const list = await getReviewsByDriver(id);
        setReviews(list);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load driver reviews");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  return (
    <AppLayout title="Driver Profile" subtitle="Verified traveler feedback" fullWidthChildren={true}>
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-600 hover:text-slate-900">← Back</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Driver ID</p>
              <h1 className="text-2xl font-black text-slate-900 mt-1">#{id}</h1>
              <p className="text-sm text-slate-500 mt-1">Average rating: <span className="font-black text-slate-800">{avgRating || "—"}</span> / 5</p>
              <p className="text-sm text-slate-500">Total reviews: <span className="font-black text-slate-800">{reviews.length}</span></p>
            </div>

            <button
              onClick={() => navigate("/trips")}
              className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800"
            >
              Explore trips
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-black text-slate-900 mb-3">Traveler reviews</h2>
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-500">No reviews yet.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-900 line-clamp-1">{review.title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Rating: <span className="font-black text-slate-700">{review.rating}/5</span>
          {review.travelerType ? <span> • {review.travelerType}</span> : null}
          {review.visitDate ? <span> • Visited {review.visitDate}</span> : null}
        </p>
      </div>
      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
        Verified
      </span>
    </div>

    <p className="text-sm text-slate-600 mt-3 whitespace-pre-line">{review.comment}</p>

    {review.imageUrls?.length > 0 && (
      <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
        {review.imageUrls.map((url, idx) => (
          <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={`review-${idx + 1}`} className="w-full h-16 rounded-xl object-cover border hover:opacity-90" />
          </a>
        ))}
      </div>
    )}
  </div>
);

export default DriverPublicProfile;
