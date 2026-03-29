import { api } from "../lib/axios";
import type { User } from "../types/auth";

export type UpdateMePayload = {
  fullName?: string;
  contactNumber?: string;
  gender?: string;
  profileImage?: string;
};

/**
 * PUT /api/v1/users/me
 * Updates current user's profile. Requires JWT (Bearer) or cookie-based auth.
 */
export const updateMe = async (payload: UpdateMePayload): Promise<User> => {
  const res = await api.put<User | { data: User }>("/users/me", payload);
  const raw: any = (res.data as any)?.data ?? res.data;

  // Normalize into our User type (backend may omit some fields).
  const stored = localStorage.getItem("soksabay_user");
  const prev: Partial<User> = stored ? JSON.parse(stored) : {};

  const merged: User = {
    userId: raw.userId ?? raw.id ?? prev.userId ?? 0,
    email: raw.email ?? prev.email ?? "",
    fullName: raw.fullName ?? raw.name ?? prev.fullName ?? "",
    gender: raw.gender ?? prev.gender ?? "",
    contactNumber: raw.contactNumber ?? prev.contactNumber ?? "",
    profileImage:
      raw.profileImage ??
      raw.profile_image ??
      raw.avatar ??
      raw.avatarUrl ??
      raw.imageUrl ??
      raw.image_url ??
      prev.profileImage ??
      "",
    role: raw.role ?? raw.roles ?? prev.role ?? ["USER"],
    // keep tokens from previous storage (update endpoint usually doesn't return them)
    accessToken: prev.accessToken ?? localStorage.getItem("accessToken") ?? "",
    refreshToken: prev.refreshToken ?? localStorage.getItem("refreshToken") ?? "",
  };

  return merged;
};
