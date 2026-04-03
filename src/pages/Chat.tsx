import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getChatConversations, getChatHistory } from "../services/chatService";
import { ChatSocket } from "../services/chatSocket";
import { uploadImage } from "../services/driverService";
import type { User } from "../types/auth";
import type { ChatMessageRequest, ChatMessageResponse, ChatMessageType } from "../types/chat";
import { clearUnread, getUnreadForUser, incrementUnread } from "../services/chatUnreadStore";

const getWsUrl = () => {
  const envURL = import.meta.env.VITE_WS_BASE_URL;
  if (envURL) return envURL;
  const apiBase = import.meta.env.VITE_API_BASE_URL || localStorage.getItem("API_BASE_URL") || "http://localhost:8080/api/v1";
  // apiBase is typically http://host:port/api/v1 => ws should be http://host:port/ws-soksabay
  const root = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${root}/ws-soksabay`;
};

const formatTime = (iso: string) => {
  try {
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
    // Backend currently sends LocalDateTime (no timezone). In Docker it's commonly UTC.
    // Treat timezone-less timestamps as UTC so the UI shows correct local time.
    const normalized = hasTimezone ? iso : `${iso}Z`;
    return new Date(normalized).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

// Format "last seen" relative time
const formatLastSeen = (lastActiveAt?: string): string => {
  if (!lastActiveAt) return "";
  try {
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(lastActiveAt);
    const normalized = hasTimezone ? lastActiveAt : `${lastActiveAt}Z`;
    const lastActive = new Date(normalized).getTime();
    const now = Date.now();
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  } catch {
    return "";
  }
};

const isMine = (meId: number | undefined, msg: ChatMessageResponse) => {
  if (!meId) return false;
  return Number(msg.senderId) === Number(meId);
};

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const meId = user?.userId;
  // Email/password flow stores JWT in localStorage.
  // OAuth2 flow may rely on HttpOnly cookies so token can be empty.
  const token = localStorage.getItem("wsAccessToken") || localStorage.getItem("accessToken") || user?.accessToken || "";

  const [searchParams] = useSearchParams();
  const preselectUserId = Number(searchParams.get("userId") || 0) || 0;

  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ChatSocket | null>(null);

  const [loadingConvos, setLoadingConvos] = useState(false);
  const [conversations, setConversations] = useState<User[]>([]);
  const [convoLastMessage, setConvoLastMessage] = useState<Record<number, string>>({});
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const activeUserIdRef = useRef<number>(0);
  const [unreadTick, setUnreadTick] = useState(0);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>("");

  // Animation state for smooth transitions
  const [convoListAnimating, setConvoListAnimating] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const [threadAnimating, setThreadAnimating] = useState(false);

  const convoRefreshTimer = useRef<number | null>(null);

  const activeUserId = activeUser?.userId ?? 0;

  // Sort conversations by most recent message time (newest on top)
  const sortedConversations = useMemo(() => {
    const toMs = (iso: string) => {
      try {
        const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
        return new Date(hasTimezone ? iso : `${iso}Z`).getTime();
      } catch {
        return 0;
      }
    };

    return [...conversations].sort((a, b) => {
      // Priority: 1) WebSocket real-time timestamps, 2) API lastMessageTime from backend
      const timeA = convoLastMessage[Number(a.userId)] || (a as any).lastMessageTime || "";
      const timeB = convoLastMessage[Number(b.userId)] || (b as any).lastMessageTime || "";
      // If neither has a timestamp, keep original order
      if (!timeA && !timeB) return 0;
      // If only one has a timestamp, put it first
      if (!timeA) return 1;
      if (!timeB) return -1;
      // Sort by timestamp descending (newest first)
      return toMs(timeB) - toMs(timeA);
    });
  }, [conversations, convoLastMessage]);

  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

  useEffect(() => {
    const onUnread = () => setUnreadTick((x) => x + 1);
    window.addEventListener("chat:unread", onUnread as any);
    return () => window.removeEventListener("chat:unread", onUnread as any);
  }, []);

  // Force re-render when unread map changes (stored in localStorage)
  useEffect(() => {
    // noop: state update already happened; effect exists only to satisfy lint/ts usage.
  }, [unreadTick]);

  const filteredMessages = useMemo(() => {
    if (!activeUserId) return [];
    return (messages || []).filter(
      (m) =>
        (Number(m.senderId) === Number(activeUserId) && Number(m.recipientId) === Number(meId)) ||
        (Number(m.senderId) === Number(meId) && Number(m.recipientId) === Number(activeUserId))
    );
  }, [messages, activeUserId, meId]);

  const orderedMessages = useMemo(() => {
    const toMs = (iso: string) => {
      try {
        const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
        return new Date(hasTimezone ? iso : `${iso}Z`).getTime();
      } catch {
        return 0;
      }
    };

    return [...filteredMessages].sort((a, b) => {
      const diff = toMs(a.timestamp) - toMs(b.timestamp);
      if (diff !== 0) return diff;
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }, [filteredMessages]);

  const scrollToBottom = () => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const refreshConversations = async (preferUserId?: number) => {
    try {
      const list = await getChatConversations();
      setConversations(list || []);

      // Never auto-switch the active conversation during background refresh.
      // Only set active when caller explicitly asks (preferUserId).
      if (!preferUserId) return;

      // Prefer the explicit userId (e.g., from ?userId=) if present.
      const targetId = Number(preferUserId || activeUserId || 0) || 0;
      if (!targetId) return;

      const hit = (list || []).find((u) => Number(u.userId) === Number(targetId));
      if (hit) setActiveUser(hit);
    } catch {
      // ignore background refresh errors
    }
  };

  const upsertConversationFromMessage = (msg: ChatMessageResponse) => {
    const otherUserId = Number(msg.senderId) === Number(meId) ? Number(msg.recipientId) : Number(msg.senderId);
    if (!otherUserId) return;

    const other: User = {
      userId: otherUserId,
      email: Number(msg.senderId) === Number(meId) ? msg.recipientEmail : msg.senderEmail,
      fullName: Number(msg.senderId) === Number(meId) ? msg.recipientName : msg.senderName,
      gender: "",
      contactNumber: "",
      role: ["USER"],
      accessToken: "",
      refreshToken: "",
    };

    // Store the latest message timestamp for sorting
    setConvoLastMessage((prev) => ({
      ...prev,
      [otherUserId]: msg.timestamp,
    }));

    setConversations((prev) => {
      const without = prev.filter((u) => Number(u.userId) !== Number(otherUserId));
      // Put the most recent chatter on top.
      return [other, ...without];
    });

    // If nothing is selected yet, auto-open this conversation.
    if (!activeUserIdRef.current) {
      setActiveUser(other);
    }
  };

  useEffect(() => {
    // load conversations
    const run = async () => {
      setLoadingConvos(true);
      try {
        const list = await getChatConversations();
        setConversations(list || []);
        // If we were navigated here with ?userId=, preselect that user.
        const pre = preselectUserId && (list || []).find((u) => Number(u.userId) === Number(preselectUserId));
        if (pre) {
          setActiveUser(pre);
        } else if (!activeUser && list?.length) {
          setActiveUser(list[0]);
        } else if (preselectUserId && !pre) {
          // We might not have a conversation yet; create a minimal placeholder.
          setActiveUser({
            userId: preselectUserId,
            email: "",
            fullName: `User #${preselectUserId}`,
            gender: "",
            contactNumber: "",
            role: ["USER"],
            accessToken: "",
            refreshToken: "",
          } as any);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load conversations");
      } finally {
        setLoadingConvos(false);
      }
    };

    run();

    // Ensure the latest conversation list is loaded once when opening the chat page.
    // (No auto-switch; refreshConversations only affects selection if preferUserId is provided.)
    refreshConversations(preselectUserId || undefined);

    // With true real-time, we shouldn't refetch conversations frequently.
    // Keep a slow refresh as a safety net (e.g., if WS misses for some reason).
    if (convoRefreshTimer.current) window.clearInterval(convoRefreshTimer.current);
    convoRefreshTimer.current = window.setInterval(() => {
      // Background refresh should not change current active chat.
      refreshConversations(undefined);
    }, 60000);

    return () => {
      if (convoRefreshTimer.current) window.clearInterval(convoRefreshTimer.current);
      convoRefreshTimer.current = null;
    };
  }, [preselectUserId]);

  useEffect(() => {
    // connect websocket
    const wsUrl = getWsUrl();
    const socket = new ChatSocket({
      wsUrl,
      token: token || undefined,
      onConnectChange: setConnected,
      onError: (e) => {
        console.warn("chat socket error", e);
        const msg =
          (e as any)?.headers?.message ||
          (e as any)?.body ||
          (e as any)?.message ||
          "Chat socket error";
        toast.error(String(msg));
      },
      onMessage: (msg) => {
        upsertConversationFromMessage(msg);

        const otherUserId =
          Number(msg.senderId) === Number(meId)
            ? Number(msg.recipientId)
            : Number(msg.senderId);
        const isIncoming = Number(msg.senderId) !== Number(meId);
        if (isIncoming && otherUserId && otherUserId !== activeUserIdRef.current) {
          incrementUnread(otherUserId, 1);
        }

        setMessages((prev) => {
          // dedupe by id when available
          if (msg?.id && prev.some((p) => p.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
    });

    socket.activate();
    socketRef.current = socket;

    return () => {
      socketRef.current?.deactivate();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    // load history when changing active user
    if (!activeUserId) {
      setMessages([]);
      return;
    }

    // Mark this conversation as read locally.
    clearUnread(activeUserId);

    const run = async () => {
      setLoadingHistory(true);
      try {
        const list = await getChatHistory(activeUserId);
        setMessages(list || []);
        setTimeout(scrollToBottom, 0);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load chat history");
      } finally {
        setLoadingHistory(false);
      }
    };

    run();
  }, [activeUserId]);

  useEffect(() => {
    setTimeout(scrollToBottom, 0);
  }, [filteredMessages.length]);

  // Animate thread when active user changes
  useEffect(() => {
    if (activeUserId) {
      setThreadAnimating(true);
      setTimeout(() => setThreadAnimating(false), 200);
    }
  }, [activeUserId]);

  const send = async (type: ChatMessageType, content?: string, mediaUrl?: string) => {
    if (!activeUserId) {
      toast.error("Select a conversation first");
      return;
    }
    if (!socketRef.current?.isConnected()) {
      toast.error("Chat not connected yet");
      return;
    }

    const payload: ChatMessageRequest = {
      recipientId: activeUserId,
      type,
      content: type === "TEXT" ? (content || "").trim() : undefined,
      mediaUrl: type !== "TEXT" ? mediaUrl : undefined,
    };

    if (payload.type === "TEXT" && !payload.content) {
      return;
    }
    if (payload.type !== "TEXT" && !payload.mediaUrl) {
      toast.error("Media upload missing");
      return;
    }

    setSending(true);
    try {
      socketRef.current.send(payload);
      setText("");
      setPendingImageUrl("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handlePickImage: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadImage(file);
      const url = uploaded?.secure_url || uploaded?.url;
      if (!url) throw new Error("Upload did not return URL");
      setPendingImageUrl(url);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSendClick = () => {
    if (pendingImageUrl) {
      send("IMAGE", text, pendingImageUrl);
      return;
    }

    send("TEXT", text);
  };

  const canSend = Boolean(
    connected &&
    !sending &&
    !uploading &&
    activeUserId &&
    (pendingImageUrl || (text || "").trim().length > 0)
  );

  return (
    <AppLayout title="Chat" subtitle="Real-time messages" fullWidthChildren={true}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversations */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900">Conversations</p>
                <p className="text-[11px] text-slate-500">
                  {connected ? "Connected" : "Connecting..."}
                </p>
              </div>
            </div>
            <div className={`max-h-[70vh] overflow-y-auto transition-opacity duration-300 ${convoListAnimating ? "opacity-50" : "opacity-100"}`}>
              {loadingConvos ? (
                <div className="p-4 text-sm text-slate-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No conversations yet.</div>
              ) : (
                sortedConversations.map((u) => {
                  const active = u.userId === activeUserId;
                  const unread = getUnreadForUser(u.userId);
                  const isOnline = (u as any).isOnline === true;
                  const lastActiveAt = (u as any).lastActiveAt;
                  const lastSeen = !isOnline && lastActiveAt ? formatLastSeen(lastActiveAt) : "";
                  
                  // Debug logging (remove in production)
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`User ${u.userId}: isOnline=`, isOnline, ', lastActiveAt=', lastActiveAt);
                  }
                  
                  return (
                    <button
                      key={u.userId}
                      onClick={() => {
                        setConvoListAnimating(true);
                        setActiveUser(u);
                        setTimeout(() => setConvoListAnimating(false), 300);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-all duration-300 ${
                        active ? "bg-emerald-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-2xl bg-[#00eb5b]/15 border border-[#00eb5b]/20 overflow-hidden flex items-center justify-center shrink-0">
                          {u.profileImage ? (
                            <img src={u.profileImage} alt={u.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#00ab42] font-black text-xs">
                              {(u.fullName || u.email || "U").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          {/* Online indicator */}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 truncate">
                            {u.fullName || u.email}
                          </p>
                          <p className={`text-[11px] truncate ${isOnline ? "text-emerald-600 font-semibold" : lastSeen ? "text-slate-400" : "text-slate-500"}`}>
                            {isOnline ? "Online" : lastSeen || u.email}
                          </p>
                        </div>

                        {unread > 0 ? (
                          <div className="shrink-0">
                            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-xl bg-red-500 text-white text-[10px] font-black">
                              {unread > 9 ? "9+" : unread}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Thread */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">
                  {activeUser ? activeUser.fullName || activeUser.email : "Select a conversation"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {activeUser ? activeUser.email : ""}
                </p>
              </div>
              <div className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border">
                {connected ? "LIVE" : "OFFLINE"}
              </div>
            </div>

            <div
              ref={threadRef}
              className={`flex-1 p-4 overflow-y-auto max-h-[60vh] bg-slate-50 transition-opacity duration-200 ${
                threadAnimating ? "opacity-50" : "opacity-100"
              }`}
            >
              {loadingHistory ? (
                <div className="text-sm text-slate-500">Loading messages...</div>
              ) : orderedMessages.length === 0 ? (
                <div className="text-sm text-slate-500">No messages yet.</div>
              ) : (
                <div className="space-y-2">
                  {orderedMessages.map((m) => {
                    const mine = isMine(meId, m);
                    return (
                      <div key={m.id || `${m.timestamp}-${m.senderId}-${m.recipientId}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm border ${mine ? "bg-white border-emerald-200" : "bg-white border-slate-200"}`}>
                          {m.type === "TEXT" ? (
                            <p className="text-slate-800 whitespace-pre-line">{m.content}</p>
                          ) : m.type === "IMAGE" ? (
                            <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                              <img src={m.mediaUrl} alt="chat" className="w-56 max-w-full rounded-xl border" />
                            </a>
                          ) : (
                            <audio controls src={m.mediaUrl} className="w-64 max-w-full" />
                          )}
                          <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-slate-400">
                            <span>{formatTime(m.timestamp)}</span>
                            {mine ? <span>{m.isRead ? "Read" : "Sent"}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              {pendingImageUrl ? (
                <div className="mb-3 flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <img src={pendingImageUrl} alt="pending" className="w-20 h-20 rounded-2xl object-cover border" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-700">Photo ready</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Add a caption (optional) and press Send.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingImageUrl("")}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <div className="flex items-end gap-2">
                <label className={`px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-wider cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={pendingImageUrl ? "Write a caption (optional)..." : "Type a message..."}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 min-h-12 max-h-32"
                />
                <button
                  onClick={handleSendClick}
                  disabled={!canSend}
                  className="px-5 py-3 rounded-2xl bg-[#00eb5b] text-slate-900 font-black hover:bg-[#00ab42] hover:text-white disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              {uploading ? (
                <p className="text-[11px] text-slate-500 mt-2">Uploading photo...</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
