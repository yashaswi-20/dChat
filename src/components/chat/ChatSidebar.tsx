import { useState, useEffect } from "react";
import { LoginButton } from "@/components/auth/login-button";
import { Client } from "@xmtp/browser-sdk";
import { ChatConversation } from "@/types/chat";
import { listConversations } from "@/lib/xmtp/conversations";
import { Plus, MessageSquare } from "lucide-react";
import { ConversationListItem } from "./ConversationListItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface ChatSidebarProps {
    client: Client;
    onSelectConversation: (conversation: ChatConversation) => void;
    selectedConversation?: ChatConversation;
    onNewChat: () => void;
    refreshTrigger?: number;
}

export const ChatSidebar = ({
    client,
    onSelectConversation,
    selectedConversation,
    onNewChat,
    refreshTrigger = 0,
}: ChatSidebarProps) => {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const convs = await listConversations(client);
                setConversations(convs);
            } catch (e) {
                console.error("Failed to load conversations", e);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();

        const stream = async () => {
            try {
                const stream = await client.conversations.stream();
                for await (const conversation of stream) {
                    setConversations((prev) => [conversation, ...prev]);
                }
            } catch (e) {
                console.error("Stream conversations error", e);
            }
        };
        stream();
    }, [client, refreshTrigger]);

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-lg font-bold text-white tracking-tight">Messages</h2>
                <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" />
            </div>

            <div className="relative flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
                        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
                        <p className="text-xs font-medium">Loading chats...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <MessageSquare className="w-5 h-5 text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium text-sm">No messages found</p>
                        <button
                            onClick={onNewChat}
                            className="mt-4 text-xs font-semibold text-white hover:underline"
                        >
                            Start a conversation
                        </button>
                    </div>
                ) : (
                    <div className="px-2 py-2 space-y-0.5">
                        {conversations.map((conv) => (
                            <ConversationListItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedConversation?.id === conv.id}
                                onSelect={onSelectConversation}
                            />
                        ))}
                    </div>
                )}
                <button
                    onClick={onNewChat}
                    className="absolute bottom-6 right-6 p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-all duration-200 shadow-lg z-10"
                >
                    <Plus className="w-5 h-5" />
                </button>

            </div>

            <div className="p-4 border-t border-zinc-900 bg-black/50 backdrop-blur-xl flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold px-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <span className="font-mono">
                        {client.inboxId ? (client.inboxId.slice(0, 8).toUpperCase() + "..." + client.inboxId.slice(-4).toUpperCase()) : "Unknown"}
                    </span>
                </div>
                <img src="/dChat.svg" alt="dChat" className="h-8 mr-4 w-auto opacity-80 hover:opacity-100 transition-opacity scale-[2.5]" />
            </div>
        </div>
    );
};

