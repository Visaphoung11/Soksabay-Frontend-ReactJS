import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessageRequest, ChatMessageResponse } from "../types/chat";

type TokenProvider = () => Promise<string>;

type ChatSocketOptions = {
  /** Full absolute URL for websocket endpoint, e.g. http://localhost:8080/ws-soksabay */
  wsUrl: string;
  /** Function that returns a fresh WebSocket token. Called on connect and reconnection. */
  getToken: TokenProvider;
  onMessage: (msg: ChatMessageResponse) => void;
  onConnectChange?: (connected: boolean) => void;
  onError?: (err: any) => void;
};

/**
 * Minimal STOMP-over-SockJS wrapper for the Soksabay chat.
 * - Connects to /ws-soksabay
 * - Subscribes to /user/queue/messages
 * - Sends to /app/chat.send
 * - Handles automatic token refresh on reconnection
 * - Refreshes token every 50 minutes to prevent expiration
 */
export class ChatSocket {
  private client: Client;
  private sub?: StompSubscription;
  private connected = false;
  private getToken: TokenProvider;
  private refreshInterval?: number;

  constructor(opts: ChatSocketOptions) {
    this.getToken = opts.getToken;

    this.client = new Client({
      webSocketFactory: () => new SockJS(opts.wsUrl) as any,
      connectHeaders: {},
      debug: () => {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        // Fetch a fresh token before each connection attempt
        try {
          const token = await opts.getToken();
          this.client.connectHeaders = {
            Authorization: `Bearer ${token}`,
          };
        } catch (err) {
          console.error("Failed to get WebSocket token before connect:", err);
        }
      },
      onConnect: () => {
        this.connected = true;
        opts.onConnectChange?.(true);
        this.sub = this.client.subscribe("/user/queue/messages", (frame: IMessage) => {
          try {
            const data = JSON.parse(frame.body);
            opts.onMessage(data as ChatMessageResponse);
          } catch (err) {
            opts.onError?.(err);
          }
        });
        
        // Start periodic token refresh (every 50 minutes)
        this.startTokenRefresh(opts);
      },
      onDisconnect: () => {
        this.connected = false;
        opts.onConnectChange?.(false);
        this.stopTokenRefresh();
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        opts.onError?.(frame);
      },
      onWebSocketError: (evt) => {
        console.error("WebSocket error:", evt);
        opts.onError?.(evt);
      },
    });
  }

  /**
   * Start periodic token refresh to prevent expiration.
   * Refreshes every 50 minutes (before the 1-hour TTL expires).
   */
  private startTokenRefresh(_opts: ChatSocketOptions): void {
    // Refresh every 50 minutes (3000000 ms)
    // This ensures we have a fresh token ready before reconnection
    this.refreshInterval = window.setInterval(async () => {
      try {
        const token = await this.getToken();
        this.client.connectHeaders = {
          Authorization: `Bearer ${token}`,
        };
        console.log("WebSocket token refreshed automatically");
      } catch (err) {
        console.warn("Failed to refresh WebSocket token:", err);
      }
    }, 50 * 60 * 1000); // 50 minutes
  }

  private stopTokenRefresh(): void {
    if (this.refreshInterval) {
      window.clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  activate() {
    this.client.activate();
  }

  deactivate() {
    this.stopTokenRefresh();
    try {
      this.sub?.unsubscribe();
    } catch {
      // ignore
    }
    this.sub = undefined;
    this.client.deactivate();
  }

  isConnected() {
    return this.connected;
  }

  send(payload: ChatMessageRequest) {
    if (!this.client.connected) {
      throw new Error("Chat socket not connected");
    }

    this.client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });
  }
}
