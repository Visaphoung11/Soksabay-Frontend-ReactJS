import React, { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead } from "../services/notificationService";
import type { Notification } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { Client } from "@stomp/stompjs";
import type { IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { toast } from "react-toastify";

const NotificationBell: React.FC = () => {
    const { isAuthenticated, refreshUser, user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);

            // Check for new approval notifications
            const hasApproval = data.some(n =>
                !n.read && (n.title.includes("Approved") || n.message.includes("verified Driver"))
            );
            if (hasApproval) {
                // Trigger a user profile refresh to update roles in the context
                await refreshUser();
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !user?.email) return;
        if (stompClientRef.current?.active) return;

        const token = user.accessToken || localStorage.getItem("accessToken") || "";
        const connectHeaders: Record<string, string> | undefined = token
            ? { Authorization: `Bearer ${token}` }
            : undefined;

        if (!token) {
            console.warn("No access token in frontend storage. Trying WebSocket with cookie/session auth.");
        }

        console.log("Opening Web Socket...");

        const wsUrl = token
            ? `http://localhost:8080/ws-soksabay?access_token=${encodeURIComponent(token)}`
            : "http://localhost:8080/ws-soksabay";

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders,
            debug: (str) => console.log("[STOMP]", str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("STOMP Connected");
                console.log("Subscribing to topic:", `/topic/notifications/${user.email}`);

                client.subscribe(`/topic/notifications/${user.email}`, async (message: IMessage) => {
                    try {
                        console.log("Incoming STOMP message:", message.body);
                        const parsed = (() => {
                            try {
                                return JSON.parse(message.body);
                            } catch {
                                return { message: message.body };
                            }
                        })();

                        const payload = parsed?.data ?? parsed;
                        const incoming: Notification = {
                            id: payload.id ?? Date.now(),
                            title: payload.title ?? "Notification",
                            message: payload.message ?? "You have a new notification",
                            read: payload.read ?? false,
                            createdAt: payload.createdAt ?? new Date().toISOString(),
                        };

                        setNotifications((prev) => {
                            if (prev.some((n) => n.id === incoming.id)) return prev;
                            return [incoming, ...prev];
                        });

                        toast.info(`${incoming.title}: ${incoming.message}`);

                        const hasApproval =
                            incoming.title.includes("Approved") ||
                            incoming.message.includes("verified Driver");
                        if (hasApproval) {
                            await refreshUser();
                        }
                    } catch (error) {
                        console.error("Failed to parse WebSocket notification:", error);
                    }
                });
            },
            onStompError: (frame: IFrame) => {
                console.error("Broker reported error:", frame.headers["message"], frame.body);
            },
            onWebSocketError: (event: Event) => {
                console.error("WebSocket error:", event);
            },
            onWebSocketClose: (event: CloseEvent) => {
                console.warn("WebSocket closed:", event.code, event.reason);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [isAuthenticated, user?.email, user?.accessToken]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleMarkRead = async (id: number) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch {
            // silently fail
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-200"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div>
                            <h3 className="text-white font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && <p className="text-white/40 text-xs">{unreadCount} unread</p>}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={async () => {
                                    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
                                    await Promise.all(unreadIds.map(markNotificationRead));
                                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <svg className="animate-spin w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="text-center py-10">
                                <svg className="w-10 h-10 text-white/10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-white/30 text-sm">No notifications yet</p>
                            </div>
                        )}

                        {!loading && notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all ${!n.read ? "bg-purple-500/5" : ""}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {!n.read && <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />}
                                            <p className={`text-sm font-medium truncate ${!n.read ? "text-white" : "text-white/60"}`}>
                                                {n.title}
                                            </p>
                                        </div>
                                        <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                                        <p className="text-white/25 text-xs mt-1">{formatDate(n.createdAt)}</p>
                                    </div>
                                    {!n.read && (
                                        <button
                                            onClick={() => handleMarkRead(n.id)}
                                            className="flex-shrink-0 text-xs text-purple-400 hover:text-purple-300 transition-colors mt-0.5"
                                        >
                                            ✓
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
