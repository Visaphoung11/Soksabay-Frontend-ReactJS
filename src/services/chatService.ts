import { api } from "../lib/axios";
import type { ChatMessageResponse } from "../types/chat";
import type { User } from "../types/auth";

type ApiList<T> = T[] | { data: T[] };

const unwrapList = <T,>(resData: any): T[] => {
  const v1 = (resData as any)?.data ?? resData;
  const v2 = (v1 as any)?.data ?? v1;
  return (Array.isArray(v2) ? v2 : (v2?.data ?? [])) as T[];
};

const normalizeConversationUser = (raw: any): User & { lastMessageTime?: string; isOnline?: boolean; lastActiveAt?: string } => {
  // Debug: log raw response
  if (process.env.NODE_ENV === 'development') {
    console.log('Conversation raw:', JSON.stringify(raw));
  }
  
  return {
    userId: Number(raw?.userId ?? raw?.id ?? 0),
    email: raw?.email ?? "",
    fullName: raw?.fullName ?? raw?.name ?? raw?.email ?? "User",
    gender: raw?.gender ?? "",
    contactNumber: raw?.contactNumber ?? "",
    profileImage: raw?.profileImage ?? raw?.avatarUrl ?? raw?.imageUrl ?? raw?.image_url,
    bannerUrl: raw?.bannerUrl ?? raw?.bannerImageUrl,
    bio: raw?.bio,
    ratingCount: raw?.ratingCount !== undefined && raw?.ratingCount !== null ? Number(raw.ratingCount) : undefined,
    role: raw?.role ?? raw?.roles ?? ["USER"],
    // Conversations endpoint won't return tokens.
    accessToken: "",
    refreshToken: "",
    // Last message timestamp from backend
    lastMessageTime: raw?.lastMessageTime ?? raw?.lastMessageAt ?? raw?.lastMessage?.timestamp ?? undefined,
    // Online status from backend - try multiple field names
    isOnline: raw?.isOnline ?? raw?.online ?? raw?.isActive ?? false,
    lastActiveAt: raw?.lastActiveAt ?? raw?.lastSeenAt ?? raw?.lastActive ?? raw?.lastSeen ?? undefined,
  };
};

/** GET /api/v1/chat/conversations */
export const getChatConversations = async (): Promise<(User & { lastMessageTime?: string; isOnline?: boolean; lastActiveAt?: string })[]> => {
  const res = await api.get<ApiList<User>>("/chat/conversations");
  const list = unwrapList<any>(res.data);
  return (list || []).map(normalizeConversationUser).filter((u) => u.userId);
};

/** GET /api/v1/chat/history/{otherUserId} */
export const getChatHistory = async (otherUserId: number): Promise<ChatMessageResponse[]> => {
  const res = await api.get<ApiList<ChatMessageResponse>>(`/chat/history/${otherUserId}`);
  return unwrapList<ChatMessageResponse>(res.data);
};
