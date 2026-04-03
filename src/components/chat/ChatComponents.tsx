import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, Badge } from "../ui";
import type { User } from "../../types/auth";

interface ConversationItemProps {
  user: User & { lastMessageTime?: string; isOnline?: boolean; lastActiveAt?: string };
  isActive: boolean;
  unreadCount: number;
  onClick: () => void;
  formatLastSeen?: (timestamp?: string) => string;
}

// Animation variants for conversation list
export const conversationItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20
    }
  }
};

export const ConversationItem: React.FC<ConversationItemProps> = ({
  user,
  isActive,
  unreadCount,
  onClick,
  formatLastSeen
}) => {
  const isOnline = (user as any).isOnline === true;
  const lastActiveAt = (user as any).lastActiveAt;
  const lastSeen = !isOnline && lastActiveAt && formatLastSeen
    ? formatLastSeen(lastActiveAt)
    : "";

  return (
    <motion.button
      variants={conversationItemVariants}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${isActive ? "bg-emerald-50" : "bg-white"
        }`}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={user.profileImage}
          name={user.fullName || user.email}
          size="md"
          online={isOnline}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-900 truncate">
            {user.fullName || user.email}
          </p>
          <p className={`text-[11px] truncate ${isOnline ? "text-emerald-600 font-semibold" : lastSeen ? "text-slate-400" : "text-slate-500"}`}>
            {isOnline ? "Online" : lastSeen || user.email}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="shrink-0">
            <Badge variant="danger">{unreadCount > 9 ? "9+" : unreadCount}</Badge>
          </div>
        )}
      </div>
    </motion.button>
  );
};

// ============== Message Bubble ==============
interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isMine: boolean;
  type: "TEXT" | "IMAGE" | "VOICE";
  mediaUrl?: string;
  isRead?: boolean;
  formatTime: (iso: string) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isMine,
  type,
  mediaUrl,
  isRead,
  formatTime
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
      layout
    >
      <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm border ${isMine ? "bg-white border-emerald-200" : "bg-white border-slate-200"}`}>
        {type === "TEXT" ? (
          <p className="text-slate-800 whitespace-pre-line">{content}</p>
        ) : type === "IMAGE" && mediaUrl ? (
          <a href={mediaUrl} target="_blank" rel="noreferrer">
            <img src={mediaUrl} alt="chat" className="w-56 max-w-full rounded-xl border" />
          </a>
        ) : type === "VOICE" && mediaUrl ? (
          <div className="flex items-center gap-2 py-1">
            <audio controls src={mediaUrl} className="w-48 h-8" />
          </div>
        ) : null}
        <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-slate-400">
          <span>{formatTime(timestamp)}</span>
          {isMine && <span>{isRead ? "Read" : "Sent"}</span>}
        </div>
      </div>
    </motion.div>
  );
};

// ============== Chat Composer ==============
interface ChatComposerProps {
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
  canSend: boolean;
  isSending: boolean;
  onPhotoPick: (file: File) => void;
  isUploading: boolean;
  onVoiceRecord: () => void;
  onVoiceStop: () => void;
  canRecord?: boolean;
  isRecording: boolean;
  recordingTime: number;
  pendingImageUrl?: string;
  pendingVoiceUrl?: string;
  onRemoveImage?: () => void;
  onRemoveVoice?: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  text,
  onTextChange,
  onSend,
  canSend,
  isSending,
  onPhotoPick,
  isUploading,
  onVoiceRecord,
  onVoiceStop,
  canRecord,
  isRecording,
  recordingTime,
  pendingImageUrl,
  pendingVoiceUrl,
  onRemoveImage,
  onRemoveVoice
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 border-t border-slate-100 bg-white">
      {/* Pending Image */}
      <AnimatePresence>
        {pendingImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50"
          >
            <img src={pendingImageUrl} alt="pending" className="w-20 h-20 rounded-2xl object-cover border" />
            <div className="flex-1">
              <p className="text-xs font-black text-slate-700">Photo ready</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Add a caption (optional) and press Send.</p>
            </div>
            <button
              type="button"
              onClick={onRemoveImage}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold"
            >
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Voice */}
      <AnimatePresence>
        {pendingVoiceUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-700">Voice message ready</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Press Send to send.</p>
            </div>
            <button
              type="button"
              onClick={onRemoveVoice}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold"
            >
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 flex items-center gap-3 p-3 rounded-2xl border border-red-200 bg-red-50"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div className="flex-1">
              <p className="text-xs font-black text-red-700">Recording...</p>
              <p className="text-[11px] text-red-500 mt-0.5">{formatTime(recordingTime)}</p>
            </div>
            <button
              type="button"
              onClick={onVoiceStop}
              className="px-3 py-2 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-bold"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Row */}
      <div className="flex items-end gap-2">
        {/* Photo */}
        <label className={`px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-wider cursor-pointer ${isUploading ? "opacity-60 pointer-events-none" : ""}`}>
          Photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPhotoPick(e.target.files[0])} />
        </label>

        {/* Voice */}
        {!isRecording ? (
          <button
            type="button"
            onClick={onVoiceRecord}
            disabled={!canRecord}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            title="Record voice message"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onVoiceStop}
            className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            title="Stop recording"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        )}

        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={pendingImageUrl ? "Write a caption (optional)..." : pendingVoiceUrl ? "Add caption (optional)..." : "Type a message..."}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 min-h-12 max-h-32"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={!canSend}
          className="px-5 py-3 rounded-2xl bg-[#00eb5b] text-slate-900 font-black hover:bg-[#00ab42] hover:text-white disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Send"}
        </motion.button>
      </div>

      {isUploading && !isRecording && (
        <p className="text-[11px] text-slate-500 mt-2">Uploading...</p>
      )}
    </div>
  );
};

// ============== Chat Header ==============
interface ChatHeaderProps {
  user?: User | null;
  isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, isConnected }) => (
  <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-sm font-black text-slate-900 truncate">
        {user ? user.fullName || user.email : "Select a conversation"}
      </p>
      <p className="text-[11px] text-slate-500 truncate">
        {user ? user.email : ""}
      </p>
    </div>
    <div className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border">
      {isConnected ? "LIVE" : "OFFLINE"}
    </div>
  </div>
);