"use client";

import { useState, useEffect } from "react";
import { Conversation } from "@/types/chat";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onNew: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onNew,
  onSwitch,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Open by default on desktop, closed on mobile
  useEffect(() => {
    if (window.innerWidth >= 768) setOpen(true);
  }, []);

  return (
    <>
      {/* Collapsed tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-8 h-full bg-surface border-r border-border-dim hover:bg-raised transition-colors"
          aria-label="Open chronicles"
        >
          <span className="text-gold-dim text-label tracking-widest [writing-mode:vertical-rl] rotate-180 select-none">
            CHRONICLES
          </span>
        </button>
      )}

      {/* Sidebar panel */}
      {open && (
        <>
          {/* Mobile backdrop — tap to close */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
        <div className="fixed inset-y-0 left-0 z-50 w-72 md:static md:w-64 md:z-auto flex flex-col shrink-0 bg-surface border-r border-border-dim animate-slide-in-left">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-border-dim">
            <span className="font-mono text-overline text-gold-dim tracking-widest">
              CHRONICLES
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-parchment-muted hover:text-gold transition-colors p-1"
              aria-label="Collapse sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* New conversation button */}
          <div className="px-3 py-3 border-b border-border-dim">
            <button
              onClick={onNew}
              className="w-full flex items-center gap-2 px-3 py-2 rounded border border-gold/20 text-gold font-mono text-label tracking-widest hover:bg-raised hover:border-gold/40 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              NEW SABHA
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 && (
              <p className="px-4 py-6 text-parchment-muted font-body text-body-sm text-center">
                No counsels yet.
              </p>
            )}
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  className={`group relative flex items-start gap-2 px-3 py-2.5 mx-2 my-0.5 rounded cursor-pointer transition-colors ${
                    isActive
                      ? "bg-raised border border-gold/20"
                      : "hover:bg-raised/60"
                  }`}
                  onClick={() => onSwitch(conv.id)}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-body text-body-sm truncate leading-snug ${
                        isActive ? "text-parchment" : "text-parchment-dim"
                      }`}
                    >
                      {conv.title}
                    </p>
                    <p className="font-mono text-overline text-parchment-muted mt-0.5">
                      {relativeTime(conv.updatedAt)}
                    </p>
                  </div>

                  {/* Delete button — always visible on touch, row-hover on desktop */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="shrink-0 mt-0.5 text-parchment-muted md:text-transparent md:group-hover:text-parchment-muted hover:!text-crimson transition-colors"
                    aria-label="Delete conversation"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}
    </>
  );
}
