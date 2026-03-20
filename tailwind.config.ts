import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0C0A14",
        surface: "#16132A",
        raised: "#1E1A38",
        "border-dim": "#2A2244",
        "border-glow": "#4A3F7A",
        gold: {
          DEFAULT: "#D4A843",
          dim: "#8A6A20",
          bright: "#F0C060",
        },
        saffron: "#E8652A",
        peacock: "#1E9E8E",
        crimson: "#C0392B",
        parchment: {
          DEFAULT: "#F0E6D2",
          dim: "#9B8E7A",
          muted: "#5A5066",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-spectral)", "Georgia", "serif"],
        devanagari: ["var(--font-noto-devanagari)", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      fontSize: {
        // Kurukshetra Dawn type scale
        "display":   ["3.5rem",    { lineHeight: "1.1",  letterSpacing: "-0.01em" }],
        "headline":  ["2.25rem",   { lineHeight: "1.25", letterSpacing: "0em"     }],
        "title":     ["1.375rem",  { lineHeight: "1.35", letterSpacing: "0.01em"  }],
        "body":      ["1rem",      { lineHeight: "1.7"                            }],
        "body-sm":   ["0.875rem",  { lineHeight: "1.6"                            }],
        "label":     ["0.6875rem", { lineHeight: "1.4",  letterSpacing: "0.08em"  }],
        "overline":  ["0.6875rem", { lineHeight: "1.4",  letterSpacing: "0.14em"  }],
      },
      backgroundImage: {
        "hatching": `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 8px,
          rgba(212, 168, 67, 0.03) 8px,
          rgba(212, 168, 67, 0.03) 9px
        )`,
      },
      keyframes: {
        "drift": {
          "0%": { backgroundPosition: "50% 0%" },
          "100%": { backgroundPosition: "50% 100%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "stagger-reveal": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 168, 67, 0.3)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212, 168, 67, 0)" },
        },
        "lotus-bloom": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "typing-dot": {
          "0%, 100%": { transform: "scaleY(1)", opacity: "0.4" },
          "50%": { transform: "scaleY(1.6)", opacity: "1" },
        },
        "glow-drift": {
          "0%": {
            background:
              "radial-gradient(ellipse at 50% 10%, rgba(30, 26, 56, 0.8) 0%, #0C0A14 60%)",
          },
          "100%": {
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(30, 26, 56, 0.9) 0%, #0C0A14 70%)",
          },
        },
      },
      animation: {
        "drift": "drift 20s ease-in-out infinite alternate",
        "fade-up": "fade-up 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "cursor-blink": "cursor-blink 0.8s step-end infinite",
        "shake": "shake 0.4s ease-in-out",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "lotus-bloom": "lotus-bloom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "typing-1": "typing-dot 1.2s ease-in-out infinite 0s",
        "typing-2": "typing-dot 1.2s ease-in-out infinite 0.2s",
        "typing-3": "typing-dot 1.2s ease-in-out infinite 0.4s",
        "glow-drift": "glow-drift 8s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
