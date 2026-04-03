import React from "react";
import { motion } from "framer-motion";
import type { User } from "../../types/auth";
import { ConversationItem } from "./ChatComponents";

interface ChatSidebarProps {
    conversations: User[];
    activeUserId: number;
    onSelect: (user: User) => void;
    getUnreadForUser: (userId: number) => number;
    connected: boolean;
    loading: boolean;
    formatLastSeen: (timestamp?: string) => string;
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

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    activeUserId,
    onSelect,
    getUnreadForUser,
    connected,
    loading,
    formatLastSeen,
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-black text-slate-900">Conversations</p>
                    <p className="text-[11px] text-slate-500">
                        {connected ? "Connected" : "Connecting..."}
                    </p>
                </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-sm text-slate-500">Loading...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">No conversations yet.</div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {conversations.map((u) => (
                            <ConversationItem
                                key={u.userId}
                                user={u as any}
                                isActive={u.userId === activeUserId}
                                unreadCount={getUnreadForUser(u.userId)}
                                onClick={() => onSelect(u)}
                                formatLastSeen={formatLastSeen}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
