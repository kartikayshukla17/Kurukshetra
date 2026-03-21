import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { retrieveContext } from "@/lib/retrieval";

// Must be nodejs runtime — Transformers.js requires Node APIs
export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface RequestMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: RequestMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid messages array");
    }
    for (const m of messages) {
      if (
        !m.role ||
        !["user", "assistant"].includes(m.role) ||
        typeof m.content !== "string"
      ) {
        throw new Error("Invalid message format");
      }
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Retrieve relevant context from Supabase for the latest user message
  const latestUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const context = await retrieveContext(latestUserMessage, 5);

  const systemWithContext = context
    ? `${SYSTEM_PROMPT}\n\n---\n\nRelevant knowledge retrieved for this query:\n\n${context}`
    : SYSTEM_PROMPT;

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: "system", content: systemWithContext },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err) {
      const apiErr = err as { status: number };
      if (apiErr.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "30" },
        });
      }
    }

    console.error("Groq API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
