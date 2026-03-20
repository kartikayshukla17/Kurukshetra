"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { Message } from "@/types/chat";
import { cn, formatTime } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
}

export default function MessageBubble({
  message,
  isStreaming,
  streamingContent,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";
  const content =
    isStreaming && streamingContent !== undefined
      ? streamingContent
      : message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAssistant) {
    return (
      <div
        className="flex justify-end"
        style={{ animation: "slide-in-right 0.3s ease-out forwards" }}
      >
        <div className="flex flex-col items-end gap-1">
          {/* "Seeker" label */}
          <div className="flex items-center gap-2 mr-1">
            <span
              className="type-overline tracking-[0.2em]"
              style={{ color: "#5a5066" }}
            >
              Seeker
            </span>
            <span className="text-[#5a5066] text-xs">◈</span>
          </div>
          {/* Bubble */}
          <div
            className="corner-accent grain-surface max-w-[75%] sm:max-w-[60%] px-4 py-3 bg-[#16132a]"
            style={{
              border: "1px solid #554336",
              borderRadius: "0",
            }}
          >
            <p
              className="text-[#f0e6d2] leading-relaxed whitespace-pre-wrap italic"
              style={{
                fontFamily: "'Spectral', Georgia, serif",
                fontSize: "0.95rem",
              }}
            >
              {content}
            </p>
            <p
              className="mt-1.5 text-[#5a5066] text-right select-none"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem" }}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-start"
      style={{ animation: "fade-up 0.35s ease-out forwards" }}
    >
      {/* Charioteer avatar */}
      <div className="flex-shrink-0 mr-3 mt-6">
        <div
          className="w-7 h-7 flex items-center justify-center bg-[#16132a]"
          style={{ border: "1px solid #8a6a20" }}
          aria-hidden
        >
          <span className="text-[#d4a843] ember-glow text-xs">◉</span>
        </div>
      </div>

      <div className="group relative max-w-[85%] sm:max-w-[75%]">
        {/* "The Charioteer" label */}
        <div className="flex items-center gap-2 mb-1.5 ml-0.5">
          <span className="text-[#d4a843] ember-glow text-xs">◈</span>
          <span
            className="type-overline tracking-[0.2em] ember-glow"
            style={{ color: "#8a6a20" }}
          >
            The Charioteer
          </span>
        </div>

        {/* Hammered-bronze bubble */}
        <div
          className="hammered-bronze grain-surface px-5 py-4 relative"
          style={{ borderRadius: "0" }}
        >
          {/* Watermark glyph */}
          <span
            className="absolute bottom-2 right-3 text-[4rem] leading-none pointer-events-none select-none text-[#d4a843]"
            style={{ opacity: 0.03 }}
            aria-hidden
          >
            ◎
          </span>

          <div
            className={cn(
              "prose-shloka text-[#f0e6d2] relative z-10",
              isStreaming && !content && "min-h-[1.5rem]",
              isStreaming && "streaming-cursor",
              // Inscription reveal: plays once on mount for completed messages
              !isStreaming && content && "reveal-inscription",
            )}
            style={{
              fontFamily: "'Spectral', Georgia, serif",
              fontSize: "0.95rem",
              lineHeight: 1.75,
            }}
          >
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              isStreaming && (
                <span className="text-[#5a5066] italic text-sm">
                  The charioteer contemplates...
                </span>
              )
            )}
          </div>

          {/* Timestamp */}
          {!isStreaming && (
            <p
              className="mt-2 text-[#5a5066] select-none relative z-10"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.62rem",
              }}
            >
              {formatTime(message.timestamp)}
            </p>
          )}
        </div>

        {/* Copy button — appears on hover */}
        {!isStreaming && content && (
          <button
            onClick={handleCopy}
            className={cn(
              "absolute -top-2 right-2",
              "flex items-center gap-1 px-2 py-0.5",
              "bg-[#16132a]",
              "text-[#5a5066] hover:text-[#9b8e7a] transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
            )}
            style={{
              border: "1px solid #554336",
              fontSize: "0.6rem",
              fontFamily: "'DM Mono', monospace",
            }}
            aria-label="Copy response"
          >
            {copied ? (
              <>
                <Check size={10} className="text-[#1e9e8e]" />
                <span className="text-[#1e9e8e]">copied</span>
              </>
            ) : (
              <>
                <Copy size={10} />
                <span>copy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
