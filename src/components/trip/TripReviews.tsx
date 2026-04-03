import React from "react";
import { StarRating } from "../common";
import type { Review, TravelerType } from "../../types/auth";

interface TripReviewsProps {
    reviews: Review[];
    reviewsLoading: boolean;
    reviewsError: string;
    isAuthenticated: boolean;
    canReview: boolean;
    averageRating: number;
    onAuthOpen: () => void;
    reviewRating: number;
    setReviewRating: (r: number) => void;
    reviewTravelerType: TravelerType;
    setReviewTravelerType: (t: TravelerType) => void;
    reviewVisitDate: string;
    setReviewVisitDate: (d: string) => void;
    reviewTitle: string;
    setReviewTitle: (t: string) => void;
    reviewComment: string;
    setReviewComment: (c: string) => void;
    reviewFiles: File[];
    onPickFiles: React.ChangeEventHandler<HTMLInputElement>;
    onRemoveFile: (index: number) => void;
    onSubmitReview: () => void;
    reviewSubmitting: boolean;
}

const TripReviews: React.FC<TripReviewsProps> = ({
    reviews,
    reviewsLoading,
    reviewsError,
    isAuthenticated,
    canReview,
    averageRating,
    onAuthOpen,
    reviewRating,
    setReviewRating,
    reviewTravelerType,
    setReviewTravelerType,
    reviewVisitDate,
    setReviewVisitDate,
    reviewTitle,
    setReviewTitle,
    reviewComment,
    setReviewComment,
    reviewFiles,
    onPickFiles,
    onRemoveFile,
    onSubmitReview,
    reviewSubmitting,
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Traveler Reviews</h2>
                    {averageRating > 0 && (
                        <div className="flex items-center gap-4 mt-2">
                            <StarRating rating={averageRating} size="lg" />
                            <div>
                                <p className="text-5xl font-black text-slate-900 leading-none">{averageRating.toFixed(1)}</p>
                                <p className="text-sm text-slate-400">{reviews.length} verified traveler reviews</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <span className="px-5 py-2 bg-emerald-100 text-emerald-700 text-xs font-black rounded-3xl">VERIFIED BOOKINGS ONLY</span>
                </div>
            </div>

            {reviewsError && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-800 mb-8">
                    {reviewsError}
                </div>
            )}

            {reviewsLoading ? (
                <p className="text-slate-400 py-12 text-center">Loading traveler stories...</p>
            ) : reviews.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                    <p className="text-slate-400">No reviews yet. Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-3xl overflow-hidden bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shrink-0">
                                        {review.userProfileImage ? (
                                            <img src={review.userProfileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl text-emerald-600 font-black">
                                                {(review.userFullName || "T").charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{review.userFullName || "Traveler"}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            {review.travelerType && <span className="capitalize">{review.travelerType.toLowerCase()}</span>}
                                            {review.visitDate && <span>• Visited {review.visitDate}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <StarRating rating={review.rating} size="sm" />
                                    <div className="mt-1 px-3 py-px bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-3xl">✓ Verified</div>
                                    <p className="text-[10px] text-slate-400 mt-2">
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="font-black text-xl text-slate-900">{review.title}</p>
                                <p className="mt-3 text-slate-600 leading-relaxed text-[15.5px] whitespace-pre-line">{review.comment}</p>
                            </div>
                            {review.imageUrls && review.imageUrls.length > 0 && (
                                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {review.imageUrls.map((url, idx) => (
                                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-3xl overflow-hidden border border-slate-100">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Write a review section */}
            <div className="mt-12 border-t border-slate-100 pt-10">
                <h3 className="font-black text-xl text-slate-900 mb-2">Share your experience</h3>
                {!isAuthenticated ? (
                    <button onClick={onAuthOpen} className="w-full py-4 bg-slate-900 text-white font-black rounded-3xl text-sm uppercase tracking-widest">
                        Sign in to write a review
                    </button>
                ) : !canReview ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center text-amber-700 text-sm">
                        You must have a CONFIRMED booking to leave a review.
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-3">Your rating</label>
                            <div className="flex gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button key={i} type="button" onClick={() => setReviewRating(i + 1)} className={`text-5xl transition-transform hover:scale-110 ${i < reviewRating ? "text-yellow-400" : "text-slate-200"}`}>★</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Traveler type</label>
                                <select value={reviewTravelerType} onChange={(e) => setReviewTravelerType(e.target.value as TravelerType)} className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm">
                                    <option value="SOLO">Solo traveler</option>
                                    <option value="COUPLES">Couple</option>
                                    <option value="FAMILY">Family</option>
                                    <option value="FRIENDS">With friends</option>
                                    <option value="BUSINESS">Business</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-400 mb-2">When did you travel?</label>
                                <input type="text" value={reviewVisitDate} onChange={(e) => setReviewVisitDate(e.target.value)} placeholder="March 2026" className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Review title</label>
                            <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Unforgettable journey!" className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Your story</label>
                            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={5} placeholder="Tell us your story..." className="w-full rounded-3xl border border-slate-200 px-5 py-4 text-sm resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Add your photos (optional)</label>
                            <input type="file" accept="image/*" multiple onChange={onPickFiles} className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-3xl file:border-0 file:bg-emerald-50 file:text-emerald-700" />
                            {reviewFiles.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {reviewFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-3xl text-xs">
                                            <span>{file.name}</span>
                                            <button type="button" onClick={() => onRemoveFile(i)} className="font-black text-red-500">✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onSubmitReview} disabled={reviewSubmitting} className="w-full py-5 bg-[#00eb5b] hover:bg-[#00ab42] text-slate-900 font-black rounded-3xl text-lg disabled:opacity-50">
                            {reviewSubmitting ? "Posting..." : "Post my review"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripReviews;
