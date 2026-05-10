# Room App

A self-hosted, Discord-style real-time communication platform. Servers, channels, threads of messages, direct messages, file attachments, and group audio/video calls — all built on a modern Next.js stack.

## Features

**Messaging**
- Text channels with cursor-paginated history (10 messages per page) and infinite scroll
- 1:1 direct messages reusing the same chat components
- Real-time send / edit / soft-delete via Socket.IO with automatic cache catch-up on reconnect
- Image and PDF attachments via UploadThing
- Inline message editing with permission checks (owner-only edit; owner / admin / moderator delete)
- Emoji picker

**Voice & Video**
- Audio and video channels backed by LiveKit (WebRTC SFU)
- Per-call JWT tokens scoped to the channel or conversation
- One-click video call toggle in any DM (`?video=true`)

**Servers & Members**
- Server creation with auto-generated invite code and default "general" channel
- Three roles: `ADMIN`, `MODERATOR`, `GUEST`
- Invite by shareable link (`/invite/<code>`), with on-the-fly code regeneration
- Member management: change role, kick, leave/delete server
- Channel CRUD restricted to admins and moderators

**Platform**
- Clerk-based authentication; first-time users are forced through a server-creation modal
- Light / dark / system theme via `next-themes`
- Mobile-friendly with a Radix Sheet drawer for the sidebars
- Single Zustand modal store driving 12 modal types

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router + Pages API), React 19, TypeScript |
| Database | Neon serverless Postgres via Prisma ORM |
| Auth | Clerk |
| Real-time messaging | Socket.IO |
| Real-time A/V | LiveKit Cloud (or self-hosted LiveKit) |
| File uploads | UploadThing |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react |
| State | Zustand (modals), TanStack React Query (chat cache) |
| Forms | react-hook-form + Zod |

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Postgres database — easiest is a free [Neon](https://neon.tech) project
- A [Clerk](https://clerk.com) project (free dev tier)
- An [UploadThing](https://uploadthing.com) project (free dev tier)
- A [LiveKit Cloud](https://cloud.livekit.io) project (free tier) — required for audio/video channels

### Environment variables

Create a `.env` file at the project root with the following:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database
DATABASE_URL=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
UPLOADTHING_TOKEN=

# LiveKit
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### Install & run

```bash
# Install dependencies (legacy-peer-deps required due to a peer-dep
# conflict between React 19 and @emoji-mart/react)
npm install --legacy-peer-deps

# Push the Prisma schema to your database
npx prisma db push
npx prisma generate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in. Your first server is created via the onboarding modal.

## Project Structure

```
app/
├── (auth)/                            Clerk sign-in / sign-up
├── (invite)/(routes)/invite/[inviteCode]/   Invite acceptance
├── (main)/(routes)/servers/[serverId]/
│   ├── channels/[channelId]/          Channel page (TEXT / AUDIO / VIDEO)
│   └── conversation/[memberId]/       DM page (with ?video=true toggle)
├── (setup)/                           First-server onboarding
└── api/
    ├── direct-messages/               GET DM history (cursor pagination)
    ├── livekit/                       LiveKit JWT issuance
    ├── messages/                      GET channel history (cursor pagination)
    ├── channels/, members/, servers/  CRUD for servers / channels / members
    └── uploadthing/                   File-upload handler
pages/api/socket/
├── io.ts                              Socket.IO server bootstrap
├── messages.ts, messages/[messageId].ts            Channel message send/edit/delete
└── direct-messages.ts, direct-messages/[…].ts      DM send/edit/delete
components/
├── chat/                              ChatHeader, ChatMessages, ChatItem, ChatInput, ChatVideoButton
├── modals/                            12 Zustand-driven modals
├── navigation/, server/               Sidebars and server header
├── providers/                         Socket, ModalProvider, QueryProvider, ThemeProvider
└── media-room.tsx                     LiveKit room mount
hooks/
├── use-chat-query.ts, use-chat-socket.ts, use-chat-scroll.ts
└── use-modal-store.ts
lib/                                   db.ts, conversation.ts, current-profile*, initial-profile.ts, utils.ts
prisma/schema.prisma                   Profile / Server / Member / Channel / Message / Conversation / DirectMessage
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npx prisma db push` | Sync the schema to your database |
| `npx prisma studio` | Browse data in a local UI |

## Architecture Notes

- **Hybrid routing**. App Router (`app/api/*`) handles REST reads and server/channel/member CRUD. Pages API (`pages/api/socket/*`) hosts Socket.IO and the emit-side mutations on messages, because Socket.IO needs the lower-level request/response object that App Router doesn't expose.
- **One chat pipeline for two contexts**. `ChatMessages`, `ChatItem`, and `ChatInput` are parameterised by `apiUrl`, `socketUrl`, `paramKey`, and `paramValue`, so channels and DMs share the same code path. The React Query cache key `[chat:{chatId}, paramValue]` keeps them isolated.
- **Real-time cache sync**. `useChatSocket` listens to `chat:{chatId}:messages` (new) and `chat:{chatId}:messages:update` (edit/delete), mutates the cache via `setQueryData` with id-based dedupe, and invalidates the query on `reconnect` to catch up after any blip.
- **LiveKit token authorisation**. `/api/livekit` looks up the requested `room` as either a `Channel` (then verifies the requester is a member of that channel's server) or a `Conversation` (verifies they are `memberOne` or `memberTwo`) before signing the JWT. Other rooms 404; non-members 403.
- **Soft deletes**. Removing a message rewrites its content to `"This message has been deleted."`, clears `fileUrl`, and flips `deleted: true`. The DB still holds the row for audit.

## Known Issues / Limitations

- **WebSocket transport in Next.js dev**. Socket.IO sometimes falls back to long-polling because Next.js's dev server doesn't always forward the WebSocket upgrade to Pages API routes. This shows up as a 1-second polling fallback and slightly laggy realtime. The proper fix is to run Socket.IO from a custom Node server (`server.ts`) instead of a Pages route — see the roadmap.
- **`--legacy-peer-deps` required**. `@emoji-mart/react@1.1.1` lists `react ^16 || ^17 || ^18` as a peer, which conflicts with React 19.
- **Cold-start latency**. Neon serverless DBs sleep after a few minutes of inactivity on the free tier; the first request after a sleep can take 1–3 seconds.

## Roadmap

- Custom Node server for proper WebSocket upgrades and lower realtime latency
- Message search (Postgres full-text or Meilisearch)
- Threads / replies, message reactions
- Push notifications
- Screen sharing UI (LiveKit already supports the track)
- End-to-end encryption for direct messages
- React Native / Expo mobile client
