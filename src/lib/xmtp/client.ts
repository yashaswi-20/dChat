import { Client } from "@xmtp/browser-sdk";
import { IdentifierKind } from "@xmtp/wasm-bindings";
import type { WalletClient } from "viem";
import { hexToBytes } from "viem";
import { AttachmentCodec, RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { DeleteCodec } from "./codecs/DeleteCodec";

let clientInstance: Client<any> | null = null;

export type XmtpEnv = "dev" | "production" | "local";

interface ClientOptions {
    walletClient: WalletClient;
    env: XmtpEnv;
}

// Extended Client type to include address for session checking
export type ChatClient = Client<any> & { address: string; inboxId: string };

const checkBrowserCompatibility = () => {
    // Check for Secure Context (HTTPS or localhost)
    if (typeof window !== "undefined" && !window.isSecureContext) {
        throw new Error(
            "XMTP requires a Secure Context (HTTPS). If testing locally on a device, strictly use localhost or set up HTTPS."
        );
    }

    // Check for Storage API (OPFS)
    if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.getDirectory) {
        throw new Error(
            "Your browser does not support the File System Access API (OPFS) needed for XMTP V3. Please use a modern browser (Chrome/Edge/Safari) and ensure you are not in Incognito/Private mode."
        );
    }
};

export const createXmtpClient = async ({
    walletClient,
    env,
}: ClientOptions): Promise<ChatClient> => {
    // Perform compatibility check before anything else
    checkBrowserCompatibility();

    if (clientInstance) {
        console.log("Returning existing XMTP client instance");
        return clientInstance as ChatClient;
    }

    if (!walletClient || !walletClient.account) {
        throw new Error("Wallet client is not connected");
    }

    const signer = {
        type: "EOA" as const,
        getIdentifier: async () => ({
            identifier: walletClient.account!.address,
            identifierKind: IdentifierKind.Ethereum,
        }),
        signMessage: async (message: string) => {
            const signature = await walletClient.signMessage({
                account: walletClient.account!,
                message
            });
            return hexToBytes(signature);
        },
    };

    try {
        console.log("Initializing XMTP V3 Client...");

        // ... inside createXmtpClient ...
        const client = await Client.create(signer, {
            env,
            codecs: [new AttachmentCodec(), new RemoteAttachmentCodec(), new DeleteCodec()],
        });

        // Monkey patch address for session management in UI
        (client as any).address = walletClient.account.address;

        console.log("XMTP V3 Client Initialized", (client as any).address);
        clientInstance = client;
        return client as ChatClient;
    } catch (error) {
        console.error("Failed to initialize XMTP client:", error);
        throw error;
    }
};

export const getXmtpClient = (): ChatClient | null => clientInstance as ChatClient | null;

export const disconnectXmtpClient = () => {
    if (clientInstance) {
        // clientInstance.close(); 
    }
    clientInstance = null;
};

export const revokeOtherInstallations = async (walletClient: WalletClient, inboxId: string, env: XmtpEnv = "dev") => {
    if (!walletClient.account) throw new Error("Wallet not connected");

    const signer = {
        type: "EOA" as const,
        getIdentifier: async () => ({
            identifier: walletClient.account!.address,
            identifierKind: IdentifierKind.Ethereum,
        }),
        signMessage: async (message: string) => {
            const signature = await walletClient.signMessage({
                account: walletClient.account!,
                message
            });
            return hexToBytes(signature);
        },
    };

    try {
        console.log(`Attempting to revoke installations for Inbox ID: ${inboxId}`);

        // 1. Get Inbox State to find installations using static method
        // type-casting Client to any because TS is failing to pick up static methods despite being in d.ts
        const inboxStates = await (Client as any).fetchInboxStates([inboxId], env);

        if (!inboxStates || inboxStates.length === 0) {
            throw new Error("Could not fetch inbox state");
        }

        const inboxState = inboxStates[0];

        // 2. Filter installations
        // Revoke ALL existing installations to ensure we can register the new one.
        const installations = inboxState.installations;

        if (installations.length === 0) {
            console.log("No installations to revoke.");
            return;
        }

        // Map to bytes for revocation
        // Accessing 'id' (which is bytes) from each installation
        const installationIds = installations.map((inst: any) => inst.id as Uint8Array);

        console.log(`Revoking ${installationIds.length} installations...`);

        // 3. Revoke using static method
        await (Client as any).revokeInstallations(signer, inboxId, installationIds, env);

        console.log("Revocation successful");

    } catch (error) {
        console.error("Failed to revoke installations:", error);
        throw error;
    }
};

