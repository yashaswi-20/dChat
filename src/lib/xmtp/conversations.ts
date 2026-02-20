import { Client, Dm, Group } from "@xmtp/browser-sdk";
import { IdentifierKind, ConsentState } from "@xmtp/wasm-bindings";
import { ChatConversation } from "@/types/chat";

export const listConversations = async (client: Client): Promise<ChatConversation[]> => {
    // Filter out Denied conversations (deleted by user)
    // Include Allowed + Unknown so new inbound DMs appear automatically
    const options = {
        consentStates: [ConsentState.Allowed, ConsentState.Unknown]
    };
    const conversations = await client.conversations.list(options);
    return conversations;
};


export const deleteConversation = async (conversation: ChatConversation): Promise<void> => {
    try {
        // "Delete" by setting consent to Denied
        await conversation.updateConsentState(ConsentState.Denied);
    } catch (e) {
        console.error("Failed to delete conversation", e);
        throw e;
    }
};

export const createConversation = async (
    client: Client,
    peerAddress: string
): Promise<ChatConversation> => {
    try {
        const identifier = {
            identifier: peerAddress,
            identifierKind: IdentifierKind.Ethereum
        };
        // Use createDmWithIdentifier for Ethereum addresses
        const conversation = await client.conversations.createDmWithIdentifier(identifier);

        // Ensure consent is reset to Allowed if it was previously Denied/Deleted
        const consent = await conversation.consentState();
        if (consent === ConsentState.Denied) {
            await conversation.updateConsentState(ConsentState.Allowed);
        }

        return conversation;
    } catch (e) {
        console.error("Failed to create conversation", e);
        throw e;
    }
};

export const checkCanMessage = async (
    client: Client,
    peerAddress: string
): Promise<boolean> => {
    try {
        const identifier = {
            identifier: peerAddress,
            identifierKind: IdentifierKind.Ethereum
        };
        // canMessage returns boolean[] zipped with input
        const results = await client.canMessage([identifier]);

        if (Array.isArray(results) && results.length > 0) {
            return results[0];
        }

        // Fallback or unexpected return type
        console.warn("Unexpected return type from canMessage:", results);
        return false;
    } catch (e) {
        console.error("Failed to check canMessage", e);
        return false;
    }
};


