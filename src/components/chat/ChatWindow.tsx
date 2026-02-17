import { useRef, useEffect, useState } from "react";
import { ChatConversation, ChatMessage } from "@/types/chat";
import { useConversationDisplay } from "@/hooks/useConversationDisplay";
import { fetchMessages, sendMessage, streamMessages, sendDeleteMessage } from "@/lib/xmtp/messages";
import { ContentTypeDelete } from "@/lib/xmtp/codecs/DeleteCodec";
import { deleteConversation } from "@/lib/xmtp/conversations";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChatWindowProps {
    conversation: ChatConversation;
    clientInboxId: string;
    onDeleteConversation?: () => void;
    onBack?: () => void;
}

export const ChatWindow = ({ conversation, clientInboxId, onDeleteConversation, onBack }: ChatWindowProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load hidden messages from local storage
    const [hiddenMessageIds, setHiddenMessageIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const stored = localStorage.getItem(`hidden-messages-${clientInboxId}`);
        if (stored) {
            setHiddenMessageIds(new Set(JSON.parse(stored)));
        }
    }, [clientInboxId]);

    const handleDeleteMessage = async (messageId: string, isRemote = false) => {
        if (isRemote) {
            // Send delete command to network
            try {
                await sendDeleteMessage(conversation, messageId);
            } catch (e) {
                alert("Failed to delete for everyone");
                return;
            }
        }

        setHiddenMessageIds(prev => {
            const next = new Set(prev);
            next.add(messageId);
            localStorage.setItem(`hidden-messages-${clientInboxId}`, JSON.stringify(Array.from(next)));
            return next;
        });

        setMessageToDelete(null);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this chat? It will be hidden until a new message is sent.")) return;

        setIsDeleting(true);
        try {
            await deleteConversation(conversation);
            if (onDeleteConversation) {
                onDeleteConversation();
            }
        } catch (e) {
            console.error("Failed to delete chat", e);
            alert("Failed to delete chat. Please try again.");
            setIsDeleting(false);
        }
    };

    // Resolve display info
    const { title, isLoading: isTitleLoading } = useConversationDisplay(conversation);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Auto-scroll on new messages
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (messages.length > 0) {
            if (isFirstLoad.current) {
                scrollToBottom("auto");
                isFirstLoad.current = false;
            } else {
                scrollToBottom("smooth");
            }
        }
    }, [messages]);

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        const loadMessages = async () => {
            setIsLoading(true);
            try {
                const initialMessages = await fetchMessages(conversation);

                // Process historical deletes
                const historicalDeletes = initialMessages.filter(m =>
                    m.contentType.typeId === "delete" && m.contentType.authorityId === "xmtp.org"
                );

                const newHiddenIds = new Set<string>();
                if (historicalDeletes.length > 0) {
                    historicalDeletes.forEach(m => {
                        const content = m.content as any;
                        if (content && content.messageId) {
                            newHiddenIds.add(content.messageId);
                        }
                    });

                    // Sync with local storage
                    setHiddenMessageIds(prev => {
                        const next = new Set([...prev, ...newHiddenIds]);
                        localStorage.setItem(`hidden-messages-${clientInboxId}`, JSON.stringify(Array.from(next)));
                        return next;
                    });
                }

                // Filter out delete command messages so they don't show up in UI
                const visibleMessages = initialMessages.filter(m =>
                    !(m.contentType.typeId === "delete" && m.contentType.authorityId === "xmtp.org")
                );

                setMessages(visibleMessages);

                // Initial scroll is handled by the messages effect, but we might want instant for load
                // We'll let the effect handle it for now as "smooth" is also acceptable, 
                // or we can force it if we want.

                cleanup = await streamMessages(conversation, (message) => {
                    // Check for Delete Content Type
                    if (message.contentType.typeId === "delete" && message.contentType.authorityId === "xmtp.org") {
                        const deleteContent = message.content as any; // Typed as any because stream yields generic
                        setHiddenMessageIds(prev => {
                            const next = new Set(prev);
                            next.add(deleteContent.messageId);
                            // We don't persist automatically here? Or maybe we should.
                            // Ideally we sync this.
                            localStorage.setItem(`hidden-messages-${clientInboxId}`, JSON.stringify(Array.from(next)));
                            return next;
                        });
                        return; // Don't add the delete request message itself to the list (or we could filter it)
                    }

                    // Only append if not already in list (dedupe by ID if possible, but minimal check here)
                    setMessages((prev) => {
                        if (prev.find(m => m.id === message.id)) return prev;
                        return [...prev, message];
                    });
                });
            } catch (e) {
                console.error("Error loading chat", e);
            } finally {
                setIsLoading(false);
            }
        };


        loadMessages();

        return () => {
            if (cleanup) cleanup();
        };
    }, [conversation.id]); // Re-run when conversation ID changes

    const handleSendMessage = async (content: string | File) => {
        setIsSending(true);
        try {
            await sendMessage(conversation, content);
            // Optimistic update or wait for stream
        } catch (e) {
            console.error("Failed to send", e);
            alert("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    // Header render:
    return (
        <div className="flex flex-col h-full bg-zinc-950 relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-zinc-800 border border-zinc-700">
                        {isTitleLoading ? "?" : title.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white tracking-tight">
                            {title.toUpperCase()}
                        </h3>
                        <span className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                            Online
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-900 rounded-full transition-all duration-200"
                    title="Delete Chat"
                >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-zinc-500 mt-20 flex flex-col items-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 rotate-3 border border-zinc-800">
                            <span className="text-3xl opacity-50">👋</span>
                        </div>
                        <p className="font-medium text-zinc-300">No messages yet</p>
                        <p className="text-sm mt-1 text-zinc-500">Say hello to start the conversation!</p>
                    </div>
                ) : (

                    messages
                        .filter(msg => !hiddenMessageIds.has(msg.id))
                        .map((msg, index, array) => {
                            const isNewDay = index === 0 || !isSameDay(new Date(msg.sentAt), new Date(array[index - 1].sentAt));

                            let dateLabel = "";
                            if (isNewDay) {
                                const date = new Date(msg.sentAt);
                                if (isToday(date)) dateLabel = "Today";
                                else if (isYesterday(date)) dateLabel = "Yesterday";
                                else dateLabel = format(date, "MMMM d, yyyy");
                            }

                            return (
                                <div key={msg.id} className="flex flex-col">
                                    {isNewDay && (
                                        <div className="flex items-center justify-center my-6">
                                            <span className="text-xs font-medium text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                                                {dateLabel}
                                            </span>
                                        </div>
                                    )}
                                    <MessageBubble
                                        message={msg}
                                        isMe={msg.senderInboxId === clientInboxId}
                                        onImageLoad={() => scrollToBottom("smooth")}
                                        onDelete={() => setMessageToDelete(msg.id)}
                                    />
                                </div>
                            );
                        })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Delete Dialog */}
            <Dialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Message</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this message? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start gap-2">
                        {messages.find(m => m.id === messageToDelete)?.senderInboxId === clientInboxId && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => messageToDelete && handleDeleteMessage(messageToDelete, true)}
                            >
                                Delete for Everyone
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => messageToDelete && handleDeleteMessage(messageToDelete, false)}
                        >
                            Delete for Me
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setMessageToDelete(null)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Input */}
            <MessageInput onSendMessage={handleSendMessage} isLoading={isSending} />
        </div>
    );
};

