export type ChatMessageType = "TEXT" | "IMAGE" | "VOICE";

export interface ChatMessageRequest {
  recipientId: number;
  /** Required when type === TEXT */
  content?: string;
  type: ChatMessageType;
  /** Required when type === IMAGE or VOICE */
  mediaUrl?: string;
}

export interface ChatMessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  recipientId: number;
  recipientName: string;
  recipientEmail: string;
  content: string;
  type: ChatMessageType;
  mediaUrl: string;
  timestamp: string;
  isRead: boolean;
}
