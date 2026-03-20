"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { ApiError } from "@/types/chat";

const ERROR_MESSAGES: Record<ApiError["type"], string> = {
  network: "The path to Dwarka is blocked. Check your connection.",
  rate_limit: "The oracle needs a moment to rest.",
  server: "An unknown force intervenes. Retry, or ask differently.",
  unknown: "Something interrupted the sage. Please try again.",
};

interface ErrorBannerProps {
  error: ApiError;
  onRetry: () => void;
  onDismiss: () => void;
}

export default function ErrorBanner({
  error,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const [countdown, setCountdown] = useState(error.retryAfter ?? 0);
  const [shaking, setShaking] = useState(true);

  // Shake on mount, stop after
  useEffect(() => {
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Rate limit countdown
  useEffect(() => {
    if (!error.retryAfter) return;
    setCountdown(error.retryAfter);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [error.retryAfter]);

  // Auto-dismiss after 10s (unless rate-limit with countdown)
  useEffect(() => {
    if (error.type === "rate_limit" && countdown > 0) return;
    const t = setTimeout(onDismiss, 10000);
    return () => clearTimeout(t);
  }, [error.type, countdown, onDismiss]);

  const message =
    error.type === "rate_limit" && countdown > 0
      ? `${ERROR_MESSAGES.rate_limit} Retry in ${countdown}s.`
      : ERROR_MESSAGES[error.type];

  return (
    <div
      role="alert"
      className="mx-4 mb-3 flex items-start gap-3 px-4 py-3 border-l-[3px] border-[#e8652a] bg-[#16132a] rounded-r"
      style={{
        animation: shaking
          ? "shake 0.4s ease-in-out"
          : "fade-up 0.25s ease-out",
        borderRadius: "0 6px 6px 0",
      }}
    >
      {/* Saffron dot */}
      <span
        className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#e8652a]"
        aria-hidden
      />

      <p
        className="flex-1 text-[#9b8e7a] text-sm leading-relaxed"
        style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic" }}
      >
        {message}
      </p>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Retry */}
        {(error.type !== "rate_limit" || countdown === 0) && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-[#8a6a20] hover:text-[#d4a843] transition-colors duration-200 text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
            aria-label="Retry request"
          >
            <RefreshCw size={11} />
            Retry
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="text-[#5a5066] hover:text-[#9b8e7a] transition-colors duration-200"
          aria-label="Dismiss error"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
