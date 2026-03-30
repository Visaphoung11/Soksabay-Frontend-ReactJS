import { api } from "../lib/axios";
import type { CreateReviewPayload, Review } from "../types/auth";

type ApiList<T> = T[] | { data: T[] };
type ApiEntity<T> = T | { data: T };

/**
 * Backend responses in this project often use one of these shapes:
 *  - { data: ... }
 *  - { data: { data: ... } }
 *  - raw entity/list
 */
const unwrapDeep = <T,>(resData: any): T => {
  const v1 = (resData as any)?.data ?? resData;
  const v2 = (v1 as any)?.data ?? v1;
  return v2 as T;
};

const normalizeReview = (input: any): Review => {
  const raw = input?.data ?? input;

  const pickString = (...vals: any[]): string | undefined => {
    for (const v of vals) {
      if (typeof v === "string" && v.trim() !== "") return v;
    }
    return undefined;
  };

  const pickNumber = (...vals: any[]): number | undefined => {
    for (const v of vals) {
      if (v === undefined || v === null) continue;
      const n = Number(v);
      if (!Number.isNaN(n) && n !== 0) return n;
    }
    return undefined;
  };

  // Backend might name the review author differently: user / passenger / reviewer / author
  const author = raw?.user ?? raw?.passenger ?? raw?.reviewer ?? raw?.author;
  const imageUrls = Array.isArray(raw?.imageUrls)
    ? raw.imageUrls
    : Array.isArray(raw?.images)
      ? raw.images
      : [];

  return {
    id: Number(raw?.id ?? 0),
    tripId: Number(raw?.tripId ?? raw?.trip?.id ?? 0),
    driverId: raw?.driverId !== undefined && raw?.driverId !== null ? Number(raw.driverId) : undefined,
    rating: Number(raw?.rating ?? 0),
    title: raw?.title ?? "",
    comment: raw?.comment ?? raw?.content ?? "",
    travelerType: raw?.travelerType ?? "SOLO",
    visitDate: raw?.visitDate ?? "",
    imageUrls: imageUrls.filter(Boolean),
    createdAt: raw?.createdAt ?? raw?.created_at,
    userId:
      pickNumber(
        raw?.userId,
        raw?.passengerId,
        raw?.reviewerId,
        raw?.authorId,
        author?.userId,
        author?.id
      ) ?? undefined,
    userFullName:
      pickString(
        raw?.userFullName,
        raw?.passengerName,
        raw?.reviewerName,
        raw?.authorName,
        author?.fullName,
        author?.name,
        author?.username
      ) ?? undefined,
    userProfileImage:
      pickString(
        raw?.userProfileImage,
        raw?.passengerProfileImage,
        raw?.passengerPhoto,
        raw?.passengerPhotoUrl,
        raw?.passengerAvatar,
        raw?.reviewerProfileImage,
        raw?.reviewerPhoto,
        raw?.authorProfileImage,
        author?.profileImage,
        author?.profileImageUrl,
        author?.photo,
        author?.photoUrl,
        author?.avatar,
        author?.avatarUrl,
        author?.imageUrl
      ) ?? undefined,
  } as Review;
};

/** POST /api/v1/reviews */
export const createReview = async (payload: CreateReviewPayload): Promise<Review> => {
  const res = await api.post<ApiEntity<Review>>("/reviews", payload);
  return normalizeReview(unwrapDeep<Review>(res.data));
};

/** GET /api/v1/reviews/trip/{tripId} */
export const getReviewsByTrip = async (tripId: number): Promise<Review[]> => {
  const res = await api.get<ApiList<Review>>(`/reviews/trip/${tripId}`);
  const unwrapped = unwrapDeep<any>(res.data);
  const list = Array.isArray(unwrapped) ? unwrapped : unwrapped?.data;
  return (list || []).map(normalizeReview);
};

/** GET /api/v1/reviews/driver/{driverId} */
export const getReviewsByDriver = async (driverId: number): Promise<Review[]> => {
  const res = await api.get<ApiList<Review>>(`/reviews/driver/${driverId}`);
  const unwrapped = unwrapDeep<any>(res.data);
  const list = Array.isArray(unwrapped) ? unwrapped : unwrapped?.data;
  return (list || []).map(normalizeReview);
};
