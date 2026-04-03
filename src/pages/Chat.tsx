import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getChatConversations, getChatHistory } from "../services/chatService";
import { getWsToken } from "../services/authService";
import { ChatSocket } from "../services/chatSocket";
import { uploadImage } from "../services/driverService";
import type { User } from "../types/auth";
import type { ChatMessageRequest, ChatMessageResponse, ChatMessageType } from "../types/chat";
import { clearUnread, getUnreadForUser } from "../services/chatUnreadStore";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatThread from "../components/chat/ChatThread";
import { ChatComposer } from "../components/chat/ChatComponents";

const getWsUrl = () => {
  const envURL = import.meta.env.VITE_WS_BASE_URL;
  if (envURL) return envURL;
  const apiBase = import.meta.env.VITE_API_BASE_URL || localStorage.getItem("API_BASE_URL") || "http://localhost:8080/api/v1";
  const root = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${root}/ws-soksabay`;
};

const formatTime = (iso: string) => {
  try {
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
    const normalized = hasTimezone ? iso : `${iso}Z`;
    return new Date(normalized).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

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

// Helper is no longer needed here as ChatThread handles it

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const meId = user?.userId;

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

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const [pendingVoiceUrl, setPendingVoiceUrl] = useState<string>("");

  const [chatKey, setChatKey] = useState(0);

  const threadRef = useRef<HTMLDivElement>(null);
  const convoRefreshTimer = useRef<number | null>(null);

  const activeUserId = activeUser?.userId ?? 0;

  // Sort conversations by most recent message time
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
      const timeA = convoLastMessage[Number(a.userId)] || a.lastMessageTime || "";
      const timeB = convoLastMessage[Number(b.userId)] || b.lastMessageTime || "";
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      return toMs(timeB) - toMs(timeA);
    });
  }, [conversations, convoLastMessage]);

  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

  useEffect(() => {
    const onUnread = () => setUnreadTick((x) => x + 1);
    window.addEventListener("chat:unread", onUnread as EventListener);
    return () => window.removeEventListener("chat:unread", onUnread as EventListener);
  }, []);

  useEffect(() => {
    // Force re-render on unread update
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

      if (!preferUserId) return;
      const targetId = Number(preferUserId || activeUserId || 0) || 0;
      if (!targetId) return;

      const hit = (list || []).find((u) => Number(u.userId) === Number(targetId));
      if (hit) setActiveUser(hit);
    } catch {
      // Ignored
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

    setConvoLastMessage((prev) => ({
      ...prev,
      [otherUserId]: msg.timestamp,
    }));

    setConversations((prev) => {
      const existing = prev.find((u) => Number(u.userId) === Number(otherUserId));
      const updatedUser: User = existing ? { ...existing } : { ...other };

      // Update name/email from the latest message metadata
      updatedUser.email = Number(msg.senderId) === Number(meId) ? msg.recipientEmail : msg.senderEmail;
      updatedUser.fullName = Number(msg.senderId) === Number(meId) ? msg.recipientName : msg.senderName;

      // Sync activeUser if it's the current one
      if (Number(updatedUser.userId) === activeUserIdRef.current) {
        setActiveUser(updatedUser);
      }

      const without = prev.filter((u) => Number(u.userId) !== Number(otherUserId));
      return [updatedUser, ...without];
    });

    if (!activeUserIdRef.current) {
      setConversations((latest) => {
        const found = latest.find((u) => Number(u.userId) === Number(otherUserId));
        if (found) setActiveUser(found);
        return latest;
      });
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoadingConvos(true);
      try {
        const list = await getChatConversations();
        setConversations(list || []);
        const pre = preselectUserId && (list || []).find((u) => Number(u.userId) === Number(preselectUserId));
        if (pre) {
          setActiveUser(pre);
        } else if (!activeUser && list?.length) {
          setActiveUser(list[0]);
        } else if (preselectUserId && !pre) {
          setActiveUser({
            userId: preselectUserId,
            email: "",
            fullName: `User #${preselectUserId}`,
            gender: "",
            contactNumber: "",
            role: ["USER"],
            accessToken: "",
            refreshToken: "",
          } as User);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        toast.error(error?.response?.data?.message || error?.message || "Failed to load conversations");
      } finally {
        setLoadingConvos(false);
      }
    };

    run();
    refreshConversations(preselectUserId || undefined);

    if (convoRefreshTimer.current) window.clearInterval(convoRefreshTimer.current);
    convoRefreshTimer.current = window.setInterval(() => {
      refreshConversations(undefined);
    }, 60000);

    return () => {
      if (convoRefreshTimer.current) window.clearInterval(convoRefreshTimer.current);
      convoRefreshTimer.current = null;
    };
  }, [preselectUserId]);

  useEffect(() => {
    const wsUrl = getWsUrl();

    // Track processed message IDs to prevent duplicate incrementing
    const processedMsgIds = new Set<number>();

    // Token provider function that fetches a fresh WebSocket token
    const getToken = async (): Promise<string> => {
      try {
        const wsResponse = await getWsToken();
        const newToken = wsResponse?.data?.accessToken;
        if (newToken) {
          // Store the fresh token for next use
          localStorage.setItem("wsAccessToken", newToken);
          return newToken;
        }
        throw new Error("No token in response");
      } catch (err) {
        console.error("Failed to fetch fresh WebSocket token:", err);
        // Fallback: try to use cached token if available
        const cachedToken = localStorage.getItem("wsAccessToken") || localStorage.getItem("accessToken") || "";
        if (cachedToken) return cachedToken;
        throw err;
      }
    };

    const socket = new ChatSocket({
      wsUrl,
      getToken,
      onConnectChange: setConnected,
      onError: (e) => {
        console.warn("chat socket error", e);
        const err = e as { headers?: { message?: string }; body?: string; message?: string };
        const msg = err?.headers?.message || err?.body || err?.message || "Chat socket error";
        toast.error(String(msg));
      },
      onMessage: (msg) => {
        // Skip if we've already processed this message ID (prevents duplicate notifications)
        const msgId = Number(msg.id);
        if (msgId && processedMsgIds.has(msgId)) {
          return;
        }
        if (msgId) {
          processedMsgIds.add(msgId);
        }

        upsertConversationFromMessage(msg);

        // Only add message to the list - don't increment unread here.
        // The ChatBell component handles unread increment for non-active conversations.
        setMessages((prev) => {
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
  }, []);

  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }

    clearUnread(activeUserId);

    const run = async () => {
      setLoadingHistory(true);
      try {
        const list = await getChatHistory(activeUserId);
        setMessages(list || []);
        setTimeout(scrollToBottom, 0);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        toast.error(error?.response?.data?.message || error?.message || "Failed to load chat history");
      } finally {
        setLoadingHistory(false);
      }
    };

    run();
  }, [activeUserId]);

  useEffect(() => {
    setTimeout(scrollToBottom, 0);
  }, [filteredMessages.length]);

  useEffect(() => {
    if (activeUserId) {
      setChatKey((k) => k + 1);
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

    if (payload.type === "TEXT" && !payload.content) return;
    if (payload.type !== "TEXT" && !payload.mediaUrl) {
      toast.error("Media upload missing");
      return;
    }

    setSending(true);
    try {
      socketRef.current.send(payload);
      setText("");
      setPendingImageUrl("");
      setPendingVoiceUrl("");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Failed to send");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadVoice(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const uploadVoice = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
      const uploaded = await uploadImage(audioFile);
      const url = uploaded?.secure_url || uploaded?.url;
      if (!url) throw new Error("Upload did not return URL");
      setPendingVoiceUrl(url);
      toast.success("Voice message ready");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to upload voice");
    } finally {
      setUploading(false);
    }
  };

  const handleSendClick = () => {
    if (pendingImageUrl) {
      send("IMAGE", text, pendingImageUrl);
      return;
    }
    if (pendingVoiceUrl) {
      send("VOICE", "Voice message", pendingVoiceUrl);
      return;
    }
    send("TEXT", text);
  };

  const canSend = Boolean(
    connected &&
    !sending &&
    !uploading &&
    activeUserId &&
    (pendingImageUrl || pendingVoiceUrl || (text || "").trim().length > 0)
  );

  const canRecord = Boolean(connected && !sending && !uploading && activeUserId);

  return (
    <AppLayout title="Chat" subtitle="Real-time messages" fullWidthChildren={true}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChatSidebar
            conversations={sortedConversations}
            activeUserId={activeUserId}
            onSelect={setActiveUser}
            getUnreadForUser={getUnreadForUser}
            connected={connected}
            loading={loadingConvos}
            formatLastSeen={formatLastSeen}
          />

          <ChatThread
            messages={orderedMessages}
            activeUser={activeUser}
            meId={Number(meId)}
            connected={connected}
            loading={loadingHistory}
            chatKey={chatKey}
            threadRef={threadRef}
            formatTime={formatTime}
          >
            <ChatComposer
              text={text}
              onTextChange={setText}
              onSend={handleSendClick}
              canSend={canSend}
              canRecord={canRecord}
              isSending={sending}
              onPhotoPick={(file) => handlePickImage({ target: { files: [file], value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>)}
              isUploading={uploading}
              onVoiceRecord={startRecording}
              onVoiceStop={stopRecording}
              isRecording={isRecording}
              recordingTime={recordingTime}
              pendingImageUrl={pendingImageUrl}
              pendingVoiceUrl={pendingVoiceUrl}
              onRemoveImage={() => setPendingImageUrl("")}
              onRemoveVoice={() => setPendingVoiceUrl("")}
            />
          </ChatThread>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
