import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessageRequest, ChatMessageResponse } from "../types/chat";

type ChatSocketOptions = {
  /** Full absolute URL for websocket endpoint, e.g. http://localhost:8080/ws-soksabay */
  wsUrl: string;
  /** Optional for OAuth2 cookie-based auth; required for JWT-based auth */
  token?: string;
  onMessage: (msg: ChatMessageResponse) => void;
  onConnectChange?: (connected: boolean) => void;
  onError?: (err: any) => void;
};

/**
 * Minimal STOMP-over-SockJS wrapper for the Soksabay chat.
 * - Connects to /ws-soksabay
 * - Subscribes to /user/queue/messages
 * - Sends to /app/chat.send
 */
export class ChatSocket {
  private client: Client;
  private sub?: StompSubscription;
  private connected = false;

  constructor(opts: ChatSocketOptions) {
    const connectHeaders: Record<string, string> = {};
    if (opts.token) {
      connectHeaders.Authorization = `Bearer ${opts.token}`;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(opts.wsUrl) as any,
      connectHeaders,
      debug: () => {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
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
      },
      onDisconnect: () => {
        this.connected = false;
        opts.onConnectChange?.(false);
      },
      onStompError: (frame) => {
        opts.onError?.(frame);
      },
      onWebSocketError: (evt) => {
        opts.onError?.(evt);
      },
    });
  }

  activate() {
    this.client.activate();
  }

  deactivate() {
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
