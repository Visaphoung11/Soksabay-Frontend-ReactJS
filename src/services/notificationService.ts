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
    await api.patch(`/notifications/${id}/read`);
};
