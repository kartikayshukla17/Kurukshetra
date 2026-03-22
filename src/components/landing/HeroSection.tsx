"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import BhishmaLogo from "@/components/ui/BhishmaLogo";
import { useLenis } from "lenis/react";

const FEATURES = [
  {
    symbol: "✦",
    title: "18 Parvas",
    desc: "From Adi Parva to Svargarohana — every book of the epic",
  },
  {
    symbol: "◎",
    title: "Bhagavad Gita",
    desc: "All 700 shlokas across 18 chapters with verse citations",
  },
  {
    symbol: "⬡",
    title: "Every Character",
    desc: "Pandavas, Kauravas, Krishna, Draupadi, Karna and beyond",
  },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  // Normalised offset: -1…+1 relative to section centre
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [scrollVel, setScrollVel] = useState(0);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      setOffset({
        x: ((e.clientX - left) / width  - 0.5) * 2,
        y: ((e.clientY - top)  / height - 0.5) * 2,
      });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  // Track Lenis scroll position and velocity
  useLenis(({ scroll, velocity }) => {
    setScrollY(scroll);
    setScrollVel(velocity);
  });

  // Mouse parallax magnitude (px)
  const logoX  =  offset.x *  6;
  const logoY  =  offset.y *  4;
  const bgX    = -offset.x *  3;
  const bgY    = -offset.y *  2;
  // Specular glint position (% within the logo box)
  const glintX =  offset.x * 30;
  const glintY =  offset.y * 30;

  // Scroll-driven parallax — layered on top of mouse parallax
  const scrollBgDrift  = -scrollY * 0.07;   // background floats up as page scrolls
  const scrollLogoDrift =  scrollY * 0.04;  // logo sinks slightly into scroll
  // Velocity-driven glow — higher speed = brighter ambient light
  const velGlowBoost   = Math.min(Math.abs(scrollVel) * 0.025, 0.18);

  return (
    <main
      ref={heroRef}
      className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-atmosphere texture-hatching">
      {/* Ambient glow — moves counter to cursor for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ transform: `translate(${bgX}px, ${bgY + scrollBgDrift}px)`, transition: "transform 0.15s ease-out" }}
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{
            opacity: 0.20 + velGlowBoost,
            background: "radial-gradient(ellipse, rgba(212,168,67,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            transition: "opacity 0.35s ease-out",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            opacity: 0.10 + velGlowBoost * 0.5,
            background: "radial-gradient(ellipse, rgba(30,158,142,0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            transition: "opacity 0.35s ease-out",
          }}
        />
      </div>

      {/* Top nav — anchors to Sabha and Shrine from the landing page */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 h-14">
        <span
          className="ember-glow"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#d4a843",
          }}
        >
          Kurukshetra
        </span>
        <div className="flex items-center gap-6">
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
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
        {/* Bhishma mark — parallax layer */}
        <div
          className="stagger-item opacity-0 mb-6 relative"
          style={{
            animationDelay: "0ms",
            filter: "drop-shadow(0 0 12px rgba(212,168,67,0.3))",
            transform: `translate(${logoX}px, ${logoY + scrollLogoDrift}px)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <BhishmaLogo size={52} />
          {/* Specular glint — follows cursor within the logo bounds */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: `radial-gradient(circle at ${50 + glintX}% ${50 + glintY}%, rgba(240,192,96,0.55) 0%, transparent 55%)`,
              mixBlendMode: "screen",
              transition: "background 0.08s ease-out",
            }}
          />
        </div>

        {/* Eyebrow */}
        <p
          className="stagger-item font-mono text-[#8a6a20] text-xs tracking-[0.3em] uppercase mb-8 opacity-0"
          style={{ animationDelay: "80ms" }}
        >
          Oracle of the Epic
        </p>

        {/* Sanskrit */}
        <div
          className="stagger-item opacity-0 mb-4"
          style={{ animationDelay: "160ms" }}
        >
          <span
            className="font-devanagari text-[#d4a843] text-2xl sm:text-3xl tracking-wide leading-loose"
            style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
          >
            धर्मक्षेत्रे कुरुक्षेत्रे
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="stagger-item opacity-0 mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#f0e6d2",
            animationDelay: "240ms",
          }}
        >
          Ask the questions
          <br />
          <em style={{ color: "#d4a843", fontStyle: "italic" }}>
            that have no easy answers.
          </em>
        </h1>

        {/* Sub */}
        <p
          className="stagger-item opacity-0 text-[#9b8e7a] max-w-lg leading-relaxed mb-12"
          style={{
            fontFamily: "'Spectral', Georgia, serif",
            fontSize: "1.05rem",
            animationDelay: "340ms",
          }}
        >
          Kurukshetra is a conversational oracle drawn from the Mahabharata —
          five thousand years of dharma, war, love, and philosophy.
        </p>

        {/* CTAs */}
        <div
          className="stagger-item opacity-0 flex flex-col sm:flex-row items-center gap-4"
          style={{ animationDelay: "400ms" }}
        >
          {/* Primary — Sabha */}
          <Link
            href="/chat"
            className="group relative inline-flex items-center gap-3 px-8 py-4 border border-[#d4a843]/40 text-[#d4a843] transition-all duration-300 hover:border-[#d4a843] hover:bg-[#d4a843]/8 hover:shadow-[0_0_30px_rgba(212,168,67,0.15)]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.1rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              borderRadius: "2px",
            }}
          >
            <span className="transition-transform duration-300 group-hover:scale-110" aria-hidden>◈</span>
            Enter the Sabha
            <span className="transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1" aria-hidden>→</span>
          </Link>

          {/* Secondary — Shrine */}
          <Link
            href="/shrine"
            className="group inline-flex items-center gap-2 px-6 py-4 transition-all duration-300"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1rem",
              fontWeight: 400,
              letterSpacing: "0.06em",
              color: "#8a6a20",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#d4a843")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8a6a20")}
          >
            <span aria-hidden>⬡</span>
            Visit the Shrine
            <span className="transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" aria-hidden>→</span>
          </Link>
        </div>

        {/* Divider */}
        <div
          className="stagger-item opacity-0 w-full max-w-md my-16"
          style={{ animationDelay: "480ms" }}
        >
          <div className="gold-line" />
        </div>

        {/* Feature cards */}
        <div
          className="stagger-item opacity-0 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl"
          style={{ animationDelay: "560ms" }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="relic-card group flex flex-col items-center gap-2 p-5 border border-[#2a2244] transition-all duration-300 hover:border-[#4a3f7a]"
            >
              <span
                className="text-[#d4a843]/60 group-hover:text-[#d4a843] transition-colors duration-300 text-lg"
                aria-hidden
              >
                {f.symbol}
              </span>
              <h3
                className="text-[#f0e6d2] font-medium text-sm tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}
              >
                {f.title}
              </h3>
              <p
                className="text-[#5a5066] text-xs text-center leading-relaxed"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
