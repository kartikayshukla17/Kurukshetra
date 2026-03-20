"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import BhishmaLogo from "@/components/ui/BhishmaLogo";

interface HeaderProps {
  onClear?: () => void;
  hasMessages?: boolean;
}

export default function Header({ onClear, hasMessages }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between",
        "px-5 sm:px-8 h-14",
        "border-b border-[#2a2244]",
        "bg-[#0c0a14]/90 backdrop-blur-md",
      )}
      style={{
        boxShadow: "0 1px 20px rgba(212, 168, 67, 0.06)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 group"
        aria-label="Kurukshetra — home"
      >
        <div className="transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(212,168,67,0.6)]">
          <BhishmaLogo size={26} />
        </div>
        <span
          className="text-[#d4a843] ember-glow tracking-wide transition-colors duration-200"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.15rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          Kurukshetra
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-5">
          <Link
            href="/chat"
            className="type-overline transition-colors duration-200 hover:text-[#d4a843]"
            style={{ color: "#5a5066" }}
          >
            Sabha
          </Link>
          <Link
            href="/shrine"
            className="type-overline transition-colors duration-200 hover:text-[#d4a843]"
            style={{ color: "#5a5066" }}
          >
            Shrine
          </Link>
        </nav>

        {hasMessages && onClear && (
          <button
            onClick={onClear}
            className="type-overline text-[#5a5066] hover:text-[#9b8e7a] transition-colors duration-200"
            aria-label="Clear conversation"
          >
            Clear
          </button>
        )}
      </div>
    </header>
  );
}
