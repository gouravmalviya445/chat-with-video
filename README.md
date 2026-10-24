# Chat with Video RAG 🎥💬

A multimodal **Retrieval-Augmented Generation (RAG)** platform for conversational Q&A over videos (direct uploads and YouTube links), with timestamp-based source citations and real-time streaming answers.

---

## 📑 Table of Contents

- [Workflows](#workflows)
  - [1. System Architecture](#1-system-architecture)
  - [2. Video Status Lifecycle](#2-video-status-lifecycle)
  - [3. YouTube Ingestion](#3-youtube-ingestion)
  - [4. Direct Upload Ingestion](#4-direct-upload-ingestion)
  - [5. Chunking & Indexing (Shared)](#5-chunking--indexing-shared)
  - [6. Conversational RAG & Streaming](#6-conversational-rag--streaming)
  - [7. Authentication & Rate Limiting](#7-authentication--rate-limiting)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Docker Compose Setup](#docker-compose-setup)
  - [Local Development](#local-development)
- [License](#license)

---

## Workflows

The system separates **interactive user traffic** (API) from **compute-heavy video processing** (background worker), connected through an asynchronous job queue.

### 1. System Architecture

```mermaid
flowchart TB
    User([User])

    subgraph Client["Client Layer"]
        Player["Video Player<br/>with timestamp seek"]
        Chat["Streaming Chat"]
        Library["Video Library"]
    end

    subgraph Backend["API Layer"]
        Auth["Authentication"]
        Limiter["Rate Limiter"]
        VideoCtrl["Video Controller"]
        ChatCtrl["Chat Controller"]
    end

    subgraph Infra["Infrastructure"]
        Queue[("Job Queue")]
        Cache[("Message Cache")]
        Storage[("Object Storage")]
        DB[("Database<br/>+ Vector Search")]
    end

    subgraph Worker["Background Worker"]
        Extract["Audio Extraction<br/>/ Transcript Fetch"]
        Chunk["Timestamp Chunking"]
        Index["Embedding & Indexing"]
    end

    subgraph AI["AI Models"]
        STT["Speech-to-Text"]
        Embed["Embedding Model"]
        LLM["Generation Model"]
    end

    User --> Client
    Client -->|"REST / SSE"| Auth
    Auth --> Limiter
    Limiter --> VideoCtrl
    Limiter --> ChatCtrl

    VideoCtrl -->|"signed upload URL"| Storage
    VideoCtrl -->|"enqueue job"| Queue
    VideoCtrl -->|"save metadata"| DB

    Queue -.->|"consume job"| Extract
    Storage -->|"fetch video"| Extract
    Extract -->|"audio"| STT
    STT -->|"word timestamps"| Chunk
    Chunk --> Index
    Index -->|"embed chunks"| Embed
    Index -->|"store chunks + vectors"| DB

    ChatCtrl -->|"embed question"| Embed
    ChatCtrl -->|"similarity search"| DB
    ChatCtrl -->|"context + prompt"| LLM
    LLM -->|"token stream"| ChatCtrl
    ChatCtrl <-->|"read / write"| Cache
    ChatCtrl -->|"persist message + sources"| DB
```

---

### 2. Video Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Video record created
    PENDING --> PROCESSING: Worker picks up job
    PROCESSING --> READY: Chunks embedded & indexed
    PROCESSING --> FAILED: Error during ingestion
    FAILED --> PENDING: Retry
    READY --> [*]
```

---

### 3. YouTube Ingestion

Uses the video's existing transcript, so no audio extraction or speech-to-text is needed.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API
    participant DB as Database
    participant Queue as Job Queue
    participant Worker
    participant YT as Transcript Source

    User->>API: Submit YouTube URL (+ optional title)
    API->>API: Validate URL & resolve title
    API->>DB: Insert video (source = YOUTUBE, status = PENDING)
    API->>Queue: Enqueue ingestion job
    API-->>User: 202 Accepted (id, status = PENDING)

    Queue->>Worker: Deliver job
    Worker->>DB: Set status = PROCESSING
    Worker->>YT: Fetch transcript
    YT-->>Worker: Segments (text, start, duration)

    Note over Worker,DB: Continues in "Chunking & Indexing (Shared)"
```

---

### 4. Direct Upload Ingestion

The client uploads the file straight to object storage, so large files never pass through the API.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API
    participant Storage as Object Storage
    participant DB as Database
    participant Queue as Job Queue
    participant Worker
    participant STT as Speech-to-Text

    User->>API: Request upload (title)
    API->>Storage: Generate signed upload URL
    Storage-->>API: Path + token
    API->>DB: Insert video (source = UPLOAD, status = PENDING)
    API-->>User: 201 Created (videoId, path, token)

    User->>Storage: Upload file via signed URL
    User->>API: Notify upload complete
    API->>Storage: Verify file exists
    API->>Queue: Enqueue ingestion job
    API-->>User: 202 Accepted (id, status = PENDING)

    Queue->>Worker: Deliver job
    Worker->>DB: Set status = PROCESSING
    Worker->>Storage: Get signed read URL
    Worker->>Worker: Extract audio and split into 10-min segments (16kHz mono)

    loop For each audio segment
        Worker->>STT: Transcribe segment
        STT-->>Worker: Word-level timestamps
        Worker->>Worker: Group words into short timed chunks
    end

    Note over Worker,DB: Continues in "Chunking & Indexing (Shared)"
```

---

### 5. Chunking & Indexing (Shared)

Both ingestion paths converge here.

```mermaid
flowchart TD
    A["Timed transcript segments<br/>(from YouTube or Upload)"] --> B["Merge segments into chunks<br/>up to 1000 characters"]
    B --> C["Attach start / end time<br/>to each chunk"]
    C --> D["Generate embeddings<br/>768-dim vectors"]
    D --> E["Begin transaction"]
    E --> F["Delete old chunks for video"]
    F --> G["Insert new chunks + vectors"]
    G --> H["Commit"]
    H --> I["Set video status = READY"]
    I --> J["Clean up temp files"]

    D -. "on error" .-> X["Set video status = FAILED"]
    G -. "on error" .-> X
```

---

### 6. Conversational RAG & Streaming

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Web Client
    participant API
    participant Cache
    participant DB as Database
    participant Embed as Embedding Model
    participant LLM as Generation Model

    User->>Web: Ask a question
    Web->>API: Send message
    API->>API: Authenticate & verify conversation ownership
    API->>DB: Save USER message
    API->>Cache: Invalidate message cache

    rect rgba(120, 160, 255, 0.12)
    Note over API,DB: Retrieval
    API->>Embed: Embed question
    Embed-->>API: Query vector
    API->>DB: Cosine-similarity search (top 5 chunks of this video)
    DB-->>API: Chunks with timestamps
    end

    rect rgba(120, 220, 160, 0.12)
    Note over API,LLM: Augmentation & Generation
    API->>API: Build prompt (question + timestamped context)
    API->>LLM: Stream answer
    LLM-->>API: Token stream
    API-->>Web: Stream tokens (SSE)
    Web-->>User: Live answer with clickable timestamps
    end

    rect rgba(255, 190, 120, 0.12)
    Note over API,DB: On completion
    LLM-->>API: Final full text
    API->>DB: Save ASSISTANT message + source chunk links
    API->>Cache: Invalidate message cache
    end
```

---

### 7. Authentication & Rate Limiting

```mermaid
flowchart TD
    Req[Incoming Request] --> Protected{Protected route?}
    Protected -- No --> Public[Serve route]
    Protected -- Yes --> Session{Valid session?}

    Session -- No --> E401[401 Unauthorized]
    Session -- Yes --> Attach[Attach user to request]

    Attach --> General{"General limit<br/>100 req / 15 min"}
    General -- Exceeded --> E429A[429 Too Many Requests]
    General -- Allowed --> Category{Route category}

    Category -- "Video ingestion" --> Ingest{"Ingestion limit<br/>10 req / 15 min"}
    Ingest -- Exceeded --> E429B[429 Ingestion limit exceeded]
    Ingest -- Allowed --> VideoH[Video ingestion handler]

    Category -- "Send chat message" --> ChatL{"Chat limit<br/>30 req / 1 min"}
    ChatL -- Exceeded --> E429C[429 Chat limit exceeded]
    ChatL -- Allowed --> ChatH[Streaming RAG handler]

    Category -- "Other API routes" --> Other[Standard handler]
```

---

## Data Model

```mermaid
erDiagram
    user ||--o{ session : "has many"
    user ||--o{ account : "has many"
    user ||--o{ videos : "owns"
    user ||--o{ conversations : "participates in"

    videos ||--o{ video_chunks : "split into"
    videos ||--o{ conversations : "subject of"

    conversations ||--o{ messages : "contains"
    messages ||--o{ message_sources : "references"
    video_chunks ||--o{ message_sources : "cited by"

    user {
        text id PK
        text name
        text email UK
        boolean emailVerified
        text image
        timestamp createdAt
        timestamp updatedAt
    }

    videos {
        uuid id PK
        text user_id FK
        text title
        text description
        video_source source "YOUTUBE | UPLOAD"
        text youtube_url
        text storage_url
        integer duration
        video_status status "PENDING | PROCESSING | READY | FAILED"
        timestamp created_at
        timestamp updated_at
    }

    video_chunks {
        uuid id PK
        uuid video_id FK
        integer chunk_index
        text content
        real start_time
        real end_time
        integer token_count
        vector_768 embedding
        timestamp created_at
    }

    conversations {
        uuid id PK
        text user_id FK
        uuid video_id FK
        text title
        timestamp created_at
        timestamp updated_at
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        message_role role "USER | ASSISTANT"
        text content
        timestamp created_at
    }

    message_sources {
        uuid id PK
        uuid message_id FK
        uuid video_chunk_id FK
        timestamp created_at
    }
```

---

## Tech Stack

| Domain               | Technology                                                                                                | Purpose                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Monorepo**         | [Turborepo](https://turbo.build/repo) + [Bun](https://bun.sh/)                                            | Fast workspace task runner & package manager                             |
| **Frontend**         | [Next.js 15](https://nextjs.org/) (App Router), React 19, Tailwind CSS                                    | Responsive UI, video player with timestamp synchronization               |
| **Backend API**      | [Express 5](https://expressjs.com/) on Bun                                                                | REST API server, rate limiting, SSE streaming                            |
| **Authentication**   | [Better Auth](https://better-auth.com/)                                                                   | Session handling, Google OAuth & credential auth                         |
| **ORM & Database**   | [Drizzle ORM](https://orm.drizzle.team/), PostgreSQL 17, [pgvector](https://github.com/pgvector/pgvector) | Vector similarity search (cosine distance `<=>`), schema migrations      |
| **Queue & Worker**   | [BullMQ](https://bullmq.io/), [Redis 7](https://redis.io/)                                                | Asynchronous background jobs for audio extraction & transcription        |
| **Media Processing** | [FFmpeg](https://ffmpeg.org/) (`fluent-ffmpeg`)                                                           | Audio stream extraction and segmentation into 10-minute segments         |
| **Storage**          | [Supabase Storage](https://supabase.com/storage)                                                          | Direct S3-compatible client-side uploads and signed URL downloads        |
| **AI SDK & Models**  | [Vercel AI SDK](https://sdk.vercel.ai/), Google Gemini                                                    | `gemini-3.5-flash-lite`, `gemini-3.5-transcribe`, `gemini-embedding-001` |

---

## Monorepo Structure

```text
chat-with-video-rag/
├── apps/
│   ├── server/                         # REST API & background worker
│   │   ├── src/
│   │   │   ├── ai/                     # LLM, transcription & embedding adapters
│   │   │   ├── config/                 # Redis, environment validation (Zod)
│   │   │   ├── controllers/            # Video, chat, and conversation handlers
│   │   │   ├── db/                     # Drizzle schema
│   │   │   ├── middleware/             # Rate limiters, auth, global error handler
│   │   │   ├── queue/                  # Video-ingestion queue configuration
│   │   │   ├── repositories/           # Database access layer
│   │   │   ├── routes/                 # API routes
│   │   │   ├── services/
│   │   │   │   ├── ingestion/          # YouTube transcripts, audio extraction, chunking
│   │   │   │   ├── chat.service.ts     # RAG pipeline orchestration
│   │   │   │   ├── retrieval.service.ts# Vector similarity queries
│   │   │   │   └── storage.service.ts  # Signed URLs & storage operations
│   │   │   └── workers/                # Video ingestion worker process
│   │   └── drizzle.config.ts
│   │
│   └── web/                            # Frontend application
│       ├── app/
│       │   ├── (auth)/                 # Sign in & Sign up pages
│       │   ├── videos/                 # Video listing & dashboard
│       │   │   └── [videoId]/chat/     # Side-by-side video player & chat
│       │   └── layout.tsx
│       ├── components/
│       │   ├── chat/                   # Chat window, message list, source citations
│       │   └── video/                  # Add video dialog, processing status
│       └── store/                      # Client-side application state
│
├── packages/
│   ├── eslint-config/                  # Shared ESLint configuration
│   └── typescript-config/              # Shared tsconfig bases
│
├── docker-compose.yml                  # PostgreSQL (pgvector) & Redis containers
├── turbo.json                          # Turborepo pipeline configuration
└── package.json                        # Root package manifest
```

---

## API Reference

### Videos

| Method   | Endpoint                          | Description                                 | Rate Limit       |
| -------- | --------------------------------- | ------------------------------------------- | ---------------- |
| `POST`   | `/api/videos/youtube`             | Enqueues a YouTube video for processing     | 10 req / 15 min  |
| `POST`   | `/api/videos/upload`              | Generates a signed upload URL               | 10 req / 15 min  |
| `POST`   | `/api/videos/:id/upload-complete` | Confirms upload & enqueues ingestion job    | 10 req / 15 min  |
| `GET`    | `/api/videos`                     | Lists all videos for the authenticated user | 100 req / 15 min |
| `GET`    | `/api/videos/:id`                 | Gets video metadata & signed streaming URL  | 100 req / 15 min |
| `DELETE` | `/api/videos/:id`                 | Deletes video, stored files, and embeddings | 100 req / 15 min |

### Conversations & Chat

| Method   | Endpoint                                      | Description                                   | Rate Limit       |
| -------- | --------------------------------------------- | --------------------------------------------- | ---------------- |
| `POST`   | `/api/videos/:videoId/conversations`          | Creates a new chat thread for a video         | 100 req / 15 min |
| `GET`    | `/api/videos/:videoId/conversations`          | Gets all chat threads for a video             | 100 req / 15 min |
| `GET`    | `/api/conversations/:conversationId`          | Gets conversation metadata                    | 100 req / 15 min |
| `DELETE` | `/api/conversations/:conversationId`          | Deletes conversation and its messages         | 100 req / 15 min |
| `GET`    | `/api/conversations/:conversationId/messages` | Fetches conversation message history (cached) | 100 req / 15 min |
| `POST`   | `/api/conversations/:conversationId/messages` | Sends message & streams RAG response via SSE  | 30 req / 1 min   |

---

## Getting Started

### Prerequisites

- [Docker & Docker Compose](https://www.docker.com/) for the Compose setup
- [Bun](https://bun.sh/) (version 1.3.14) for local development
- [FFmpeg](https://ffmpeg.org/) for processing uploaded videos when running the worker locally
- A [Google Gemini API Key](https://aistudio.google.com/)
- A [Supabase](https://supabase.com/) project with a Storage bucket

### Docker Compose Setup

Compose starts PostgreSQL with pgvector, Redis, the API and worker, and the Next.js web app. Create the environment files referenced by Compose:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/server/.env` and provide your Gemini, Supabase, and Better Auth settings. For the local Compose services, use these connection values (the hostnames are the Compose service names):

```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgres://postgres:password@postgres:5432/video_rag
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_TLS=
BETTER_AUTH_SECRET=replace_with_a_random_secret_at_least_32_characters
BETTER_AUTH_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=video-uploads
```

Google OAuth credentials should be configured for the app's callback URL if you use Google sign-in.

In `apps/web/.env`, set the API URL to the host-mapped API port. This value is used when the web image is built:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_CALLBACK_URL=http://localhost:3000
```

Build and start the stack from the repository root:

```bash
docker compose up --build -d
```

The backend container runs database migrations at startup. To follow startup logs or stop the stack:

```bash
docker compose logs -f server
docker compose down
```

`docker compose down` preserves the database and Redis data in named volumes. To remove those volumes and their data as well, run `docker compose down -v`.

| Service | URL |
| --- | --- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) |

### Local Development

For running the apps on the host instead, start PostgreSQL and Redis first:

```bash
docker compose up -d postgres redis
```

Set `DATABASE_URL` to use `localhost:5432` in `apps/server/.env`, and set `REDIS_HOST=localhost`. Install dependencies and start the development apps:

```bash
bun install
bun run dev
```

The API defaults to port `8000`; the frontend runs at [http://localhost:3000](http://localhost:3000). Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `apps/web/.env`.

---

## License

This project is licensed under the MIT License.
