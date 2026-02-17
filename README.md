# dChat Project Documentation

**dChat** is a decentralized, secure messaging application built on the **XMTP (Extensible Message Transport Protocol)** network. It allows users to send encrypted messages directly between Ethereum wallet addresses without relying on centralized servers for data storage.

## Key Features

- **Wallet-to-Wallet Messaging**: Log in with your Ethereum wallet (MetaMask, Rainbow, etc.).
- **End-to-End Encryption**: Messages are encrypted and can only be decrypted by the recipient.
- **XMTP V3 Integration**: Uses the latest XMTP browser SDK for improved performance and group chat capabilities (ready).
- **Session Management**: Handles device limits (10/10 installations) with a built-in revocation feature.
- **Dark Mode UI**: A premium, monochromatic dark aesthetic using Tailwind CSS.
- **Auto-Scroll**: Smart message scrolling that stays at the bottom of the chat.
- **IPFS File Sharing**: Securely share images and files using Pinata IPFS and XMTP Remote Attachments.
- **Smart Date Headers**: Messages are automatically grouped by date (Today, Yesterday, etc.).
- **Delete for Everyone**: Recall messages for all participants using custom XMTP content types.
- **Responsive Design**: Fully functional on mobile and desktop devices.

## Tech Stack

### Core Frameworks
- **Next.js 16 (App Router)**: The React framework for production. Handles routing and server-side rendering.
- **TypeScript**: Ensures type safety across the application.
- **Tailwind CSS 4**: Utility-first CSS framework for styling.
- **shadcn/ui**: Reusable components built with Radix UI and Tailwind CSS.

### Web3 & Messaging
- **@xmtp/browser-sdk (V3)**: The core library for interacting with the XMTP network.
- **Wagmi & Viem**: Hooks and utilities for Ethereum wallet connection and interactions.
- **RainbowKit**: A polished UI for connecting wallets.
- **Pinata SDK (pinata-web3)**: IPFS service for decentralized file storage.
- **@xmtp/content-type-remote-attachment**: Codec for handling large file attachments.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
```

## Project Structure

The project follows a standard Next.js App Router structure, with logic separated into `components`, `lib`, and `hooks`.

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/               # Main chat interface route
│   │   └── page.tsx        # Chat page entry point
│   ├── layout.tsx          # Global layout (Providers, Fonts)
│   └── page.tsx            # Landing page (redirects to /chat)
│
├── components/
│   ├── auth/               # Authentication components
│   │   └── login-button.tsx
│   ├── chat/               # Chat-specific UI components
│   │   ├── ChatLayout.tsx          # Main grid layout
│   │   ├── ChatSidebar.tsx         # List of active conversations
│   │   ├── ChatWindow.tsx          # Message view for a specific chat
│   │   ├── ConversationListItem.tsx
│   │   ├── MessageBubble.tsx       # Styled message row
│   │   ├── MessageInput.tsx        # Text input area
│   │   └── NewChatModal.tsx        # Start new conversation
│   ├── layout/             # Shared layout components
│   │   └── navbar.tsx
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx, dialog.tsx, input.tsx, etc.
│   └── providers.tsx       # Global providers wrapper
│
├── hooks/
│   ├── use-toast.tsx       # Toast notifications
│   └── useConversationDisplay.ts
│
├── lib/
│   ├── ipfs.ts             # IPFS Upload Service
│   ├── logger.ts           # Logging utility
│   ├── utils.ts            # Class merging utility (cn)
│   └── xmtp/               # XMTP Logic Isolation
│       ├── client.ts       # Client creation & config
│       ├── conversations.ts
│       ├── messages.ts     # Message handling
│       └── codecs/         # Custom Content Types
│           └── DeleteCodec.ts
│
└── types/
    └── chat.ts             # TypeScript definitions
```

## Common Issues & Solutions

### "10/10 Installations" Error
- **Cause**: XMTP allows a max of 10 login sessions per wallet.
- **Fix**: The app automatically detects this error and shows a **"Revoke Other Sessions"** button. This calls `revokeOtherInstallations` to clear old keys.

### "OPFS / Secure Context" Error on Mobile
- **Cause**: XMTP V3 requires HTTPS to access the File System API.
- **Fix**: Always serve the app over HTTPS. If testing on mobile via local network, use a tunneling service (like ngrok) or port forwarding.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
