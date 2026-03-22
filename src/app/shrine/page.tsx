"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Bookmark, Share2, Plus } from "lucide-react";
import BhishmaLogo from "@/components/ui/BhishmaLogo";
import { cn } from "@/lib/utils";
import { useLenis } from "lenis/react";

interface Verse {
  id: string;
  tag: string;
  context: string;
  quote: string;
}

const FILTERS = ["All", "Dharma", "Karma", "Yoga", "Bhakti"] as const;
type Filter = (typeof FILTERS)[number];

function shouldSearch(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (/^\d+\.\d+/.test(trimmed)) return true;
  const words = trimmed.split(/\s+/);
  return words.length > 1 || words[0].length >= 4;
}

// ─── Verse Card ────────────────────────────────────────────────────────────
function VerseCard({ verse }: { verse: Verse }) {
  return (
    <article
      className={cn(
        "relic-card group flex flex-col p-4 sm:p-6 md:p-8 min-h-[240px] sm:min-h-[280px] md:min-h-[320px]",
        "transition-all duration-700",
        "border border-[#2a2244] hover:shadow-[0px_0px_30px_rgba(212,168,67,0.08)] hover:border-[#4a3f7a]",
      )}
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-[#2a2244] group-hover:bg-[#8a6a20] transition-colors duration-500" />

      <div className="relative z-10 mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="type-title italic ember-glow" style={{ color: "#d4a843" }}>
            Gita {verse.id}
          </span>
          <span
            className="type-overline px-2 py-0.5 self-start"
            style={{ border: "1px solid rgba(212,168,67,0.2)", color: "#8a6a20", background: "rgba(212,168,67,0.04)" }}
          >
            {verse.tag}
          </span>
        </div>
        <button className="metallic-action text-[#5a5066] group-hover:text-[#d4a843] transition-colors" aria-label="Bookmark verse">
          <Bookmark size={16} />
        </button>
      </div>

      <blockquote
        className="relative z-10 mb-auto italic leading-relaxed font-display text-[1.1rem] text-[#f0e6d2]"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        &ldquo;{verse.quote}&rdquo;
      </blockquote>

      <div className="relative z-10 mt-10 flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="type-overline" style={{ color: "#5a5066" }}>Sanctuary Entry</span>
          <span className="type-body-sm italic" style={{ color: "#9b8e7a" }}>{verse.context}</span>
        </div>
        <button className="metallic-action text-[#5a5066] hover:text-[#d4a843] transition-colors" aria-label="Share verse">
          <Share2 size={14} />
        </button>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ShrinePage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchVerses(q?: string) {
    setLoading(true);
    setFetchError(false);
    try {
      const url = q ? `/api/verses?q=${encodeURIComponent(q)}` : "/api/verses";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Verse[] = await res.json();
      setVerses(data);
    } catch {
      setFetchError(true);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }

  const lenis = useLenis();

  // Re-measure scroll height after verses load (dynamic content changes page height)
  useEffect(() => {
    lenis?.resize();
  }, [verses, lenis]);

  // Load defaults on mount
  useEffect(() => {
    fetchVerses();
  }, []);

  // Debounced search — fires 400ms after user stops typing, only if condition met
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      fetchVerses();
      return;
    }
    debounceRef.current = setTimeout(() => {
      if (shouldSearch(query)) fetchVerses(query);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const filtered = activeFilter === "All"
    ? verses
    : verses.filter((v) => v.tag === activeFilter);

  return (
    <div className="min-h-screen bg-[#0c0a14] text-[#f0e6d2]">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(30,26,56,0.9) 0%, transparent 55%), #0c0a14" }}
        />
        <span className="ember-particle" style={{ top: "15%", left: "22%" }} />
        <span className="ember-particle" style={{ top: "42%", left: "78%" }} />
        <span className="ember-particle" style={{ top: "68%", left: "45%" }} />
        <span className="ember-particle" style={{ top: "30%", left: "60%" }} />
        <span className="ember-particle" style={{ top: "80%", left: "12%" }} />
        <span className="ember-particle" style={{ top: "55%", left: "90%" }} />
        <div
          className="absolute bottom-0 right-0 w-1/3 h-1/3 pointer-events-none flex items-center justify-center"
          style={{ maskImage: "radial-gradient(circle, black 0%, transparent 70%)", opacity: 0.025 }}
        >
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "30rem", color: "#d4a843", lineHeight: 1, userSelect: "none" }}>◎</span>
        </div>
      </div>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 sm:px-8 h-14 backdrop-blur-md"
        style={{ background: "rgba(12,10,20,0.92)", borderBottom: "1px solid rgba(42,34,68,0.8)", boxShadow: "0 1px 20px rgba(212,168,67,0.06)" }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(212,168,67,0.6)]">
            <BhishmaLogo size={26} />
          </div>
          <span className="ember-glow tracking-wide" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "0.05em", color: "#d4a843" }}>
            Kurukshetra
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/chat" className="type-overline transition-colors duration-200 hover:text-[#d4a843]" style={{ color: "#5a5066" }}>Sabha</Link>
          <span
            className="type-overline ember-glow relative"
            style={{ color: "#d4a843", paddingBottom: "3px", borderBottom: "1px solid rgba(212,168,67,0.6)" }}
          >
            Shrine
          </span>
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 px-6 sm:px-10 lg:px-16 py-14 max-w-6xl mx-auto">
        <div className="mb-14 space-y-4">
          <h1
            className="italic font-bold tracking-tight text-[#f0e6d2]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.05 }}
          >
            The Shrine of Verses
          </h1>
          <p className="type-body max-w-2xl leading-relaxed" style={{ color: "#9b8e7a" }}>
            A celestial archive of gathered wisdom. Each fragment is a beacon in the fog of Maya, preserved for the moment of doubt.
          </p>
        </div>

        {/* ── Search + Filters ── */}
        <div className="mb-10 flex flex-col md:flex-row gap-8 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="type-overline" style={{ color: "#8a6a20" }}>Search through the Ages</label>
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Seek a hidden truth..."
                className={cn("w-full bg-transparent py-3 px-0", "type-title italic placeholder-[#5a5066]", "outline-none focus-visible:shadow-none", "transition-colors duration-200")}
                style={{ borderBottom: "1px solid #2a2244", color: "#f0e6d2", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#d4a843")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#2a2244")}
              />
              <Search size={16} className="absolute right-0 top-3.5 transition-colors duration-200" style={{ color: query ? "#d4a843" : "#5a5066" }} />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn("px-4 py-1.5 type-overline transition-all duration-200", activeFilter === f ? "text-[#d4a843] ember-glow" : "text-[#5a5066] hover:text-[#9b8e7a]")}
                style={{
                  border: activeFilter === f ? "1px solid rgba(212,168,67,0.4)" : "1px solid rgba(42,34,68,0.8)",
                  background: activeFilter === f ? "rgba(212,168,67,0.06)" : "transparent",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="dhanush-divider mb-12" />

        {/* ── Verse grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="relic-card min-h-[320px] border border-[#2a2244] animate-pulse" />
              ))
            : filtered.map((verse) => <VerseCard key={verse.id} verse={verse} />)
          }

          {!loading && fetchError && (
            <div className="col-span-3 flex flex-col items-center gap-3 py-12">
              <span className="text-[#e8652a] text-2xl" aria-hidden>⚠</span>
              <p className="type-body text-center" style={{ color: "#9b8e7a" }}>
                Could not load verses — check your connection.
              </p>
              <button
                onClick={() => fetchVerses(query || undefined)}
                className="type-overline px-4 py-2 border border-[#e8652a]/40 text-[#e8652a] hover:border-[#e8652a] transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !fetchError && filtered.length === 0 && (
            <p className="col-span-3 text-center type-body italic" style={{ color: "#5a5066" }}>
              No verses found for that search.
            </p>
          )}

          <Link
            href="/chat"
            className={cn("group flex flex-col items-center justify-center p-8 min-h-[320px]", "border-2 border-dashed border-[#2a2244]", "hover:border-[#8a6a20] hover:bg-[#d4a843]/[0.03]", "transition-all duration-500 cursor-pointer")}
          >
            <Plus size={40} className="text-[#2a2244] group-hover:text-[#8a6a20] transition-colors duration-300 mb-3" />
            <span className="italic type-title text-[#2a2244] group-hover:text-[#8a6a20] transition-colors duration-300 text-center" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Inscribe a new fragment...
            </span>
            <span className="type-label mt-2 text-center" style={{ color: "#5a5066" }}>Visit the Sabha to ask the oracle</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
