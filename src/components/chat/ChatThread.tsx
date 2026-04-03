import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessageResponse } from "../../types/chat";
import { MessageBubble, ChatHeader } from "./ChatComponents";
import type { User } from "../../types/auth";

interface ChatThreadProps {
    messages: ChatMessageResponse[];
    activeUser: User | null;
    meId: number | undefined;
    connected: boolean;
    loading: boolean;
    chatKey: number;
    threadRef: React.RefObject<HTMLDivElement | null>;
    formatTime: (iso: string) => string;
    children?: React.ReactNode;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

const ChatThread: React.FC<ChatThreadProps> = ({
    messages,
    activeUser,
    meId,
    connected,
    loading,
    chatKey,
    threadRef,
    formatTime,
    children,
}) => {
    return (
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col">
            <ChatHeader user={activeUser} isConnected={connected} />

            <div ref={threadRef} className="flex-1 p-4 overflow-y-auto max-h-[60vh] bg-slate-50">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-slate-500"
                        >
                            Loading messages...
                        </motion.div>
                    ) : messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-slate-500"
                        >
                            No messages yet.
                        </motion.div>
                    ) : (
                        <motion.div
                            key={chatKey}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-2"
                        >
                            {messages.map((m) => (
                                <MessageBubble
                                    key={m.id || `${m.timestamp}-${m.senderId}-${m.recipientId}`}
                                    content={m.content || ""}
                                    timestamp={m.timestamp}
                                    isMine={Number(m.senderId) === Number(meId)}
                                    type={m.type}
                                    mediaUrl={m.mediaUrl}
                                    isRead={m.isRead}
                                    formatTime={formatTime}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {children}
        </div>
    );
};

export default ChatThread;
