"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
}

export default function MessageList({
  messages,
  isStreaming,
  streamingContent,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const userScrolledUp = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeKnot, setActiveKnot] = useState(0);

  // Track whether user has scrolled up
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledUp.current = distFromBottom > 200;
      setShowScrollBtn(distFromBottom > 200);
      const pct = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      setScrollPercent(isNaN(pct) ? 0 : pct);
      // Active knot: which message index is nearest to 40% down the viewport
      const children = el.querySelectorAll("[data-msg]");
      let nearest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const rect = child.getBoundingClientRect();
        const dist = Math.abs(rect.top - el.getBoundingClientRect().top - el.clientHeight * 0.4);
        if (dist < minDist) { minDist = dist; nearest = i; }
      });
      setActiveKnot(nearest);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Auto-scroll on new content, unless user scrolled up
  useEffect(() => {
    if (!userScrolledUp.current) {
      scrollToBottom("smooth");
    }
  }, [messages, streamingContent]);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom("instant");
  }, []);

  // Find the streaming assistant message
  const lastMsg = messages[messages.length - 1];
  const isLastAssistant = lastMsg?.role === "assistant";

  const stringTop = 24; // px inset from top/bottom of the track
  const stringBottom = 24;

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* ── Bowstring breadcrumb (desktop only) ─────────────────────────────
          A vertical dhanush string on the left with one knot per message.
          The nock (filled circle) rides the string at the current scroll %.
      ─────────────────────────────────────────────────────────────────── */}
      {messages.length > 1 && (
        <div
          aria-hidden
          className="hidden md:block absolute left-0 top-0 bottom-0 w-5 pointer-events-none z-10"
        >
          {/* String */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: stringTop,
              bottom: stringBottom,
              width: 1,
              background: "linear-gradient(to bottom, transparent, #4a3f7a 15%, #8a6a20 50%, #4a3f7a 85%, transparent)",
            }}
          />
          {/* Message knots */}
          {messages.map((msg, i) => {
            const trackH = 100 - ((stringTop + stringBottom) / (containerRef.current?.clientHeight ?? 400)) * 100;
            const pct = messages.length < 2 ? 0 : (i / (messages.length - 1)) * trackH;
            const isActive = i === activeKnot;
            return (
              <div
                key={msg.id}
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 rounded-full transition-all duration-300",
                  isActive ? "knot-active" : "",
                )}
                style={{
                  top: `calc(${stringTop}px + ${pct}%)`,
                  width: msg.role === "assistant" ? 6 : 4,
                  height: msg.role === "assistant" ? 6 : 4,
                  marginLeft: msg.role === "assistant" ? -3 : -2,
                  background: isActive ? "#d4a843" : msg.role === "assistant" ? "#8a6a20" : "#2a2244",
                }}
              />
            );
          })}
          {/* Nock — current scroll position indicator */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#d4a843] ember-glow transition-all duration-100"
            style={{
              top: `calc(${stringTop}px + ${scrollPercent * (100 - ((stringTop + stringBottom) / (containerRef.current?.clientHeight ?? 400)) * 100)}%)`,
              marginLeft: -4,
              boxShadow: "0 0 6px rgba(212,168,67,0.8)",
            }}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const showStreaming =
              isStreaming && isLast && msg.role === "assistant";
            return (
              <div key={msg.id} data-msg={i}>
                <MessageBubble
                  message={msg}
                  isStreaming={showStreaming}
                  streamingContent={showStreaming ? streamingContent : undefined}
                />
              </div>
            );
          })}

          {/* Show typing indicator only when streaming with no content yet */}
          {isStreaming && (!isLastAssistant || streamingContent === "") && (
            <TypingIndicator />
          )}

          <div ref={bottomRef} aria-hidden />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => {
            userScrolledUp.current = false;
            scrollToBottom("smooth");
          }}
          className={cn(
            "absolute bottom-4 right-4",
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
            "border border-[#d4a843]/30 bg-[#16132a] text-[#d4a843]",
            "text-xs hover:border-[#d4a843] hover:bg-[#1e1a38] transition-all duration-200",
            "shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
          )}
          style={{
            fontFamily: "'DM Mono', monospace",
            animation: "fade-up 0.2s ease-out forwards",
          }}
          aria-label="Scroll to latest message"
        >
          <ChevronDown size={13} />
          latest
        </button>
      )}
    </div>
  );
}
