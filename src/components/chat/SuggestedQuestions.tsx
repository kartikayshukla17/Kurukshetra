"use client";

import {
  SUGGESTED_QUESTIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/lib/suggested-questions";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <div
      className="flex flex-col items-center px-4 py-8 sm:py-12 max-w-2xl mx-auto w-full"
      role="region"
      aria-label="Suggested questions"
    >
      {/* Greeting */}
      <div className="text-center mb-8" style={{ animation: "lotus-bloom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
        <p
          className="mb-2 text-[#d4a843]"
          style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: "1.4rem",
            letterSpacing: "0.05em",
          }}
        >
          नमस्ते
        </p>
        <p
          className="text-[#9b8e7a] text-sm"
          style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic" }}
        >
          Welcome to the Sabha. Ask what weighs upon your heart.
        </p>
      </div>

      <div className="gold-line w-32 mb-8" />

      {/* Question grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full stagger-children">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelect(q.text)}
            className="grain-surface stagger-item group text-left px-4 py-3.5 border border-[#2a2244] bg-[#16132a]/60 rounded transition-all duration-250 hover:border-[#4a3f7a] hover:bg-[#1e1a38] hover:shadow-[0_0_15px_rgba(212,168,67,0.06)] opacity-0"
          >
            {/* Category badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[q.category] }}
                aria-hidden
              />
              <span
                className="text-[#5a5066] group-hover:text-[#9b8e7a] transition-colors duration-200"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                {CATEGORY_LABELS[q.category]}
              </span>
            </div>
            {/* Question text */}
            <p
              className="text-[#9b8e7a] group-hover:text-[#f0e6d2] transition-colors duration-200 leading-snug"
              style={{
                fontFamily: "'Spectral', Georgia, serif",
                fontSize: "0.88rem",
                fontStyle: "italic",
              }}
            >
              {q.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
