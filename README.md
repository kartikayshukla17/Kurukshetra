# Kurukshetra

A conversational oracle built on the Mahabharata. Ask questions about the epic, its characters, the Bhagavad Gita, and the philosophical traditions of dharma, karma, and moksha — and receive answers grounded in the actual text via a RAG pipeline.

## Pages

**Sabha** (`/chat`) — The main chat interface. Conversations are persisted in localStorage with full multi-conversation history. Responses stream in real time.

**Shrine** (`/shrine`) — A browsable archive of Bhagavad Gita verses with search and category filtering.

## How it works

```
User message
    ↓
Embed query — Xenova/all-MiniLM-L6-v2 (runs server-side via @huggingface/transformers)
    ↓
Supabase pgvector — cosine similarity search, top-5 chunks
    ↓
Retrieved context injected into system prompt
    ↓
Groq API — llama-3.3-70b-versatile (streamed)
    ↓
ReadableStream → browser
```

The knowledge base is built from hand-curated chunks covering all 18 Parvas, the full Bhagavad Gita (700 shlokas), key characters, and philosophical concepts. The LLM is instructed to answer **only** from retrieved context — if the retrieval comes back empty, it says so rather than hallucinating.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, Node.js runtime) |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | `Xenova/all-MiniLM-L6-v2` via `@huggingface/transformers` |
| Vector store | Supabase with `pgvector` |
| Styling | Tailwind CSS v4 |
| Scroll | Lenis smooth scroll |
| Icons | Lucide React |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

- `GROQ_API_KEY` — from [console.groq.com](https://console.groq.com)
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — from your Supabase project settings

### 3. Supabase setup

Enable the `pgvector` extension in your Supabase project and create the knowledge table:

```sql
create extension if not exists vector;

create table knowledge (
  id bigserial primary key,
  text text not null,
  embedding vector(384)
);

create or replace function match_knowledge(
  query_embedding vector(384),
  match_count int default 5
)
returns table (text text, similarity float)
language sql stable
as $$
  select text, 1 - (embedding <=> query_embedding) as similarity
  from knowledge
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

Then seed the table by embedding and inserting the chunks from `src/lib/chunks.ts`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    page.tsx                  # Landing page
    chat/page.tsx             # Sabha — chat UI
    shrine/page.tsx           # Shrine — verse browser
    api/
      chat/route.ts           # Streaming chat endpoint (RAG + Groq)
      verses/route.ts         # Gita verse API
  components/
    chat/                     # ChatContainer, MessageBubble, TypingIndicator, ErrorBanner, ...
    landing/                  # HeroSection
    layout/                   # Header, LenisProvider
    ui/                       # BhishmaLogo, ChakraSVG
  hooks/
    useChat.ts                # Conversation state, streaming, persistence
  lib/
    retrieval.ts              # Embed query + Supabase vector search
    chunks.ts                 # Knowledge base source text
    system-prompt.ts          # Vyasa persona + strict RAG instructions
    suggested-questions.ts    # Empty-state question prompts
```
