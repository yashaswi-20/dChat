import { useState, useEffect } from "react";
import { ChatConversation } from "@/types/chat";

export interface ConversationDisplay {
    title: string;
    description: string;
    avatarSeed: string;
    isLoading: boolean;
}

export const useConversationDisplay = (conversation: ChatConversation): ConversationDisplay => {
    const [display, setDisplay] = useState<ConversationDisplay>({
        title: "Loading...",
        description: "",
        avatarSeed: "",
        isLoading: true
    });

    useEffect(() => {
        let isMounted = true;

        const resolve = async () => {
            try {
                let title = conversation.id;
                let description = "Chat";
                let avatarSeed = conversation.id;

                // Check for DM (peerInboxId method)
                if ('peerInboxId' in conversation && typeof (conversation as any).peerInboxId === 'function') {
                    const dm = conversation as any;
                    try {
                        const peerInboxId = await dm.peerInboxId();
                        title = peerInboxId.slice(0, 6) + "..." + peerInboxId.slice(-4);
                        description = "Direct Message";
                        avatarSeed = peerInboxId;
                    } catch (e) {
                        console.warn("Failed to get peerInboxId", e);
                        title = "Unknown User";
                    }
                }
                // Check for Group (groupName method or property)
                else if ('groupName' in conversation) {
                    const group = conversation as any;
                    // groupName might be a method or property depending on SDK version?
                    // Dm.ts had helpers. Group.ts likely similar.
                    // Assuming property access or sync method?
                    // Usually V3 accessors are async if fetching from DB, but some might be cached.
                    // Let's assume usage: await group.groupName() or group.groupName
                    // Checking bindings... likely async.
                    if (typeof group.groupName === 'function') {
                        title = await group.groupName();
                    } else {
                        title = group.groupName;
                    }
                    description = "Group Chat";
                    avatarSeed = group.id;
                }

                if (isMounted) {
                    setDisplay({
                        title,
                        description,
                        avatarSeed,
                        isLoading: false
                    });
                }
            } catch (e) {
                console.error("Failed to resolve conversation display", e);
                if (isMounted) {
                    setDisplay(prev => ({ ...prev, isLoading: false, title: "Unknown" }));
                }
            }
        };

        resolve();

        return () => {
            isMounted = false;
        };
    }, [conversation.id]);

    return display;
};
