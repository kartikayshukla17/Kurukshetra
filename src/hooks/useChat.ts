"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Message, ApiError, ChatState } from "@/types/chat";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "kurukshetra_messages";

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

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isStreaming: false,
    streamingContent: "",
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>("");

  // Load persisted messages on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setState((s) => ({ ...s, messages: parsed }));
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist messages on change
  useEffect(() => {
    if (state.messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
    } catch {
      // ignore storage errors
    }
  }, [state.messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (state.isStreaming) return;

    lastUserMessageRef.current = content;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Optimistic: add user message and a placeholder assistant message
    const assistantId = generateId();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setState((s) => ({
      ...s,
      messages: [...s.messages, userMsg, assistantMsg],
      isStreaming: true,
      streamingContent: "",
      error: null,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiMessages = [
        ...state.messages.map((m) => ({ role: m.role, content: m.content })),
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
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setState((s) => ({ ...s, streamingContent: accumulated }));
      }

      // Flush streaming content into the placeholder message
      setState((s) => ({
        ...s,
        isStreaming: false,
        streamingContent: "",
        messages: s.messages.map((m) =>
          m.id === assistantId ? { ...m, content: accumulated } : m
        ),
      }));
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User-cancelled: keep partial content if any
        setState((s) => ({
          ...s,
          isStreaming: false,
          messages: s.messages.map((m) =>
            m.id === assistantId
              ? { ...m, content: s.streamingContent || "[Stopped]" }
              : m
          ),
          streamingContent: "",
        }));
        return;
      }

      // API error: remove the empty assistant placeholder, show error
      const apiError: ApiError =
        typeof err === "object" && err !== null && "type" in err
          ? (err as ApiError)
          : { type: "network", message: "Network error" };

      setState((s) => ({
        ...s,
        isStreaming: false,
        streamingContent: "",
        messages: s.messages.filter((m) => m.id !== assistantId),
        error: apiError,
      }));
    }
  }, [state.messages, state.isStreaming]);

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
    setState({
      messages: [],
      isStreaming: false,
      streamingContent: "",
      error: null,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    ...state,
    sendMessage,
    stopStreaming,
    retry,
    dismissError,
    clearConversation,
  };
}
