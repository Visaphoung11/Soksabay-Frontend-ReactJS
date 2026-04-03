import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { useAuth } from "../context/AuthContext";
import type { ChatMessageResponse } from "../types/chat";
import { getUnreadTotal, incrementUnread, isMessageProcessed, markMessageProcessed } from "../services/chatUnreadStore";
import { getWsToken } from "../services/authService";

const getWsUrl = () => {
  const envURL = import.meta.env.VITE_WS_BASE_URL;
  if (envURL) return envURL;
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    localStorage.getItem("API_BASE_URL") ||
    "http://localhost:8080/api/v1";
  const root = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${root}/ws-soksabay`;
};

const ChatBell: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const stompClientRef = useRef<Client | null>(null);
  const [unread, setUnread] = useState<number>(getUnreadTotal());

  useEffect(() => {
    const handler = () => setUnread(getUnreadTotal());
    window.addEventListener("chat:unread", handler as any);
    return () => window.removeEventListener("chat:unread", handler as any);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;
    if (stompClientRef.current?.active) return;

    // Token provider function that fetches a fresh WebSocket token
    const getToken = async (): Promise<string> => {
      try {
        const wsResponse = await getWsToken();
        const newToken = wsResponse?.data?.accessToken;
        if (newToken) {
          localStorage.setItem("wsAccessToken", newToken);
          return newToken;
        }
        throw new Error("No token in response");
      } catch (err) {
        console.error("Failed to fetch WebSocket token:", err);
        const cachedToken = localStorage.getItem("wsAccessToken") || localStorage.getItem("accessToken") || "";
        if (cachedToken) return cachedToken;
        throw err;
      }
    };

    let active = true;
    let refreshInterval: ReturnType<typeof setInterval> | undefined;

    // Connect and set up periodic token refresh
    const setupConnection = async () => {
      try {
        const token = await getToken();
        if (!active) return;

        const connectHeaders: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };

        const client = new Client({
          webSocketFactory: () => new SockJS(getWsUrl()),
          connectHeaders,
          debug: () => { },
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          beforeConnect: async () => {
            try {
              const freshToken = await getToken();
              client.connectHeaders = {
                Authorization: `Bearer ${freshToken}`,
              };
            } catch (err) {
              console.warn("Failed to refresh token before reconnect:", err);
            }
          },
          onConnect: () => {
            client.subscribe("/user/queue/messages", (frame: IMessage) => {
              try {
                const msg = JSON.parse(frame.body) as ChatMessageResponse;
                const msgId = msg.id;

                if (msgId && isMessageProcessed(msgId)) {
                  console.log("[ChatBell] Already processed message ID:", msgId);
                  return;
                }
                if (msgId) {
                  markMessageProcessed(msgId);
                }

                const meId = Number(user.userId);
                const senderId = Number(msg.senderId);

                // Only process incoming messages (sent TO the current user)
                const isIncoming = senderId !== meId;

                if (!isIncoming) {
                  return;
                }

                // Only increment if not on chat page
                if (window.location.pathname.startsWith("/chat")) {
                  return;
                }

                // Use sender's ID as the conversation key (who sent the message)
                const conversationKey = senderId;

                incrementUnread(conversationKey, 1);
              } catch (err) {
                console.error("[ChatBell] Error processing message:", err);
              }
            });
          },
        });

        if (!active) return;
        client.activate();
        stompClientRef.current = client;

        // Refresh token every 50 minutes
        refreshInterval = setInterval(async () => {
          try {
            await getToken();
          } catch (err) {
            console.warn("Token refresh failed:", err);
          }
        }, 50 * 60 * 1000);

      } catch (err) {
        console.error("Failed to set up chat socket:", err);
      }
    };

    setupConnection();

    return () => {
      active = false;
      if (refreshInterval) clearInterval(refreshInterval);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [isAuthenticated, user?.userId]);

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => navigate("/chat")}
      className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100/50 hover:bg-slate-100 text-slate-400 hover:text-[#00ab42] border border-slate-200/50 transition-all duration-300 group"
      title="Chat"
    >
      <svg
        className="w-5 h-5 transition-transform group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M7 8h10M7 12h6m-8 8l4-4h11a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h3z"
        />
      </svg>

      {unread > 0 ? (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-red-500/30 border-2 border-white">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </button>
  );
};

export default ChatBell;
