"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Message, Conversation, ApiError, ChatState } from "@/types/chat";
import { generateId } from "@/lib/utils";

const CONVERSATIONS_KEY = "kurukshetra_conversations";
const ACTIVE_KEY = "kurukshetra_active";

function classifyError(status: number, retryAfter?: string): ApiError {
  if (status === 429) {
    return {
      type: "rate_limit",
      message: "Rate limited",
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : 30,
    };
  }
  if (status >= 500) {
    return { type: "server", message: "Server error" };
  }
  return { type: "unknown", message: "Unknown error" };
}

function makeTitle(content: string): string {
  return content.length > 42 ? content.slice(0, 42).trimEnd() + "…" : content;
}

function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch { /* ignore */ }
}

function saveActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch { /* ignore */ }
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeId: null,
    isStreaming: false,
    streamingContent: "",
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>("");

  // Load persisted conversations on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_KEY);
      const activeId = localStorage.getItem(ACTIVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Conversation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const id = activeId && parsed.find(c => c.id === activeId)
            ? activeId
            : parsed[0].id;
          setState((s) => ({ ...s, conversations: parsed, activeId: id }));
          return;
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Derived: messages for the active conversation
  const activeConversation = state.conversations.find(c => c.id === state.activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  const updateActiveMessages = useCallback((
    id: string,
    updater: (msgs: Message[]) => Message[]
  ) => {
    setState((s) => {
      const updated = s.conversations.map((c) =>
        c.id === id
          ? { ...c, messages: updater(c.messages), updatedAt: Date.now() }
          : c
      );
      saveConversations(updated);
      return { ...s, conversations: updated };
    });
  }, []);

  const newConversation = useCallback(() => {
    const conv: Conversation = {
      id: generateId(),
      title: "New counsel",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setState((s) => {
      const updated = [conv, ...s.conversations];
      saveConversations(updated);
      saveActiveId(conv.id);
      return { ...s, conversations: updated, activeId: conv.id, error: null };
    });
  }, []);

  const switchConversation = useCallback((id: string) => {
    abortRef.current?.abort();
    saveActiveId(id);
    setState((s) => ({ ...s, activeId: id, isStreaming: false, streamingContent: "", error: null }));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setState((s) => {
      const updated = s.conversations.filter((c) => c.id !== id);
      saveConversations(updated);
      let nextId = s.activeId;
      if (s.activeId === id) {
        nextId = updated.length > 0 ? updated[0].id : null;
        saveActiveId(nextId);
      }
      return { ...s, conversations: updated, activeId: nextId };
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (state.isStreaming) return;

    lastUserMessageRef.current = content;

    // Create a new conversation if none is active
    let currentId = state.activeId;
    if (!currentId) {
      const conv: Conversation = {
        id: generateId(),
        title: makeTitle(content),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setState((s) => {
        const updated = [conv, ...s.conversations];
        saveConversations(updated);
        saveActiveId(conv.id);
        return { ...s, conversations: updated, activeId: conv.id };
      });
      currentId = conv.id;
    }

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    // Add user + placeholder assistant message, set conversation title on first message
    setState((s) => {
      const updated = s.conversations.map((c) => {
        if (c.id !== currentId) return c;
        const isFirst = c.messages.length === 0;
        return {
          ...c,
          title: isFirst ? makeTitle(content) : c.title,
          messages: [...c.messages, userMsg, assistantMsg],
          updatedAt: Date.now(),
        };
      });
      saveConversations(updated);
      return { ...s, conversations: updated, isStreaming: true, streamingContent: "", error: null };
    });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const currentMessages = state.conversations
        .find(c => c.id === currentId)?.messages ?? [];

      const apiMessages = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const retryAfter = response.headers.get("Retry-After") ?? undefined;
        throw classifyError(response.status, retryAfter);
      }

      if (!response.body) throw { type: "unknown", message: "No response body" };

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setState((s) => ({ ...s, streamingContent: accumulated }));
      }

      updateActiveMessages(currentId!, (msgs) =>
        msgs.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
      );
      setState((s) => ({ ...s, isStreaming: false, streamingContent: "" }));
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState((s) => {
          updateActiveMessages(currentId!, (msgs) =>
            msgs.map((m) =>
              m.id === assistantId ? { ...m, content: s.streamingContent || "[Stopped]" } : m
            )
          );
          return { ...s, isStreaming: false, streamingContent: "" };
        });
        return;
      }

      const apiError: ApiError =
        typeof err === "object" && err !== null && "type" in err
          ? (err as ApiError)
          : { type: "network", message: "Network error" };

      updateActiveMessages(currentId!, (msgs) => msgs.filter((m) => m.id !== assistantId));
      setState((s) => ({ ...s, isStreaming: false, streamingContent: "", error: apiError }));
    }
  }, [state.activeId, state.isStreaming, state.conversations, updateActiveMessages]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    const lastMsg = lastUserMessageRef.current;
    if (!lastMsg) return;
    setState((s) => ({ ...s, error: null }));
    sendMessage(lastMsg);
  }, [sendMessage]);

  const dismissError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    if (!state.activeId) return;
    updateActiveMessages(state.activeId, () => []);
    setState((s) => ({ ...s, isStreaming: false, streamingContent: "", error: null }));
  }, [state.activeId, updateActiveMessages]);

  return {
    messages,
    conversations: state.conversations,
    activeId: state.activeId,
    isStreaming: state.isStreaming,
    streamingContent: state.streamingContent,
    error: state.error,
    sendMessage,
    stopStreaming,
    retry,
    dismissError,
    clearConversation,
    newConversation,
    switchConversation,
    deleteConversation,
  };
}
