import { api } from "../lib/axios";
import type { Notification } from "../types/auth";

export interface NotificationsResponse {
    data: Notification[];
    message: string;
    success: boolean;
    timestamp: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const res = await api.get<NotificationsResponse>("/notifications");
    return res.data.data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
    const candidates: Array<() => Promise<any>> = [
        () => api.patch(`/notifications/${id}/read`),
        () => api.put(`/notifications/${id}/read`),
        () => api.post(`/notifications/${id}/read`),
    ];

    let lastError: any;
    for (const call of candidates) {
        try {
            await call();
            return;
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError;
};

export const markAllNotificationsRead = async (ids: number[]): Promise<void> => {
    const bulkCandidates: Array<() => Promise<any>> = [
        () => api.patch("/notifications/read-all"),
        () => api.post("/notifications/read-all"),
        () => api.patch("/notifications/mark-all-read"),
        () => api.post("/notifications/mark-all-read"),
    ];

    for (const call of bulkCandidates) {
        try {
            await call();
            return;
        } catch {
            // try next endpoint shape
        }
    }

    await Promise.allSettled(ids.map((id) => markNotificationRead(id)));
};
