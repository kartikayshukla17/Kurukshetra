"use client";

import { useEffect, useRef, useCallback, useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, BookOpen, Swords, Users, Sparkles, Command } from "lucide-react";
import { motion, AnimatePresence, useAnimate } from "motion/react";
import ChakraSVG from "@/components/ui/ChakraSVG";

// ─── Spark particle type ───────────────────────────────────────────────────
interface Spark {
  id: number;
  x: number;
  y: number;
  tx: string;
  ty: string;
}

// ─── Auto-resize hook ──────────────────────────────────────────────────────
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const el = textareaRef.current;
      if (!el) return;
      if (reset) { el.style.height = `${minHeight}px`; return; }
      el.style.height = `${minHeight}px`;
      el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight ?? Infinity))}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handler = () => adjustHeight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

// ─── Mahabharata command shortcuts ────────────────────────────────────────
const COMMANDS = [
  {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    label: "Dharma",
    description: "Questions of righteousness and duty",
    prefix: "/dharma",
  },
  {
    icon: <BookOpen className="w-3.5 h-3.5" />,
    label: "Gita",
    description: "Krishna's counsel from the Bhagavad Gita",
    prefix: "/gita",
  },
  {
    icon: <Swords className="w-3.5 h-3.5" />,
    label: "Yudh",
    description: "The great war at Kurukshetra",
    prefix: "/yudh",
  },
  {
    icon: <Users className="w-3.5 h-3.5" />,
    label: "Patra",
    description: "Heroes, sages, and their stories",
    prefix: "/patra",
  },
] as const;

const PLACEHOLDERS = [
  "Ask about dharma, the Gita, or any character...",
  "What troubles Arjuna on the battlefield?",
  "Speak of Krishna's counsel to the Pandavas...",
  "What is the nature of duty, O Sanjaya?",
];

// ─── Props (matches existing ChatInput interface) ─────────────────────────
export interface AnimatedAIChatProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────
export function AnimatedAIChat({ onSend, onStop, isStreaming, disabled }: AnimatedAIChatProps) {
  const [value, setValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const [btnScope, animateBtn] = useAnimate<HTMLButtonElement>();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 56, maxHeight: 160 });

  // Cycle placeholder text
  useEffect(() => {
    if (isStreaming) return;
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 4500);
    return () => clearInterval(t);
  }, [isStreaming]);

  // Mouse tracking for the ambient glow
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Show command palette when value starts with "/"
  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const idx = COMMANDS.findIndex((c) => c.prefix.startsWith(value));
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  // Close palette on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const cmdBtn = document.querySelector("[data-cmd-btn]");
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !cmdBtn?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCommand = (index: number) => {
    setValue(COMMANDS[index].prefix + " ");
    setShowCommandPalette(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
    adjustHeight(true);
  };

  // ── Dhanush Release — tension → fire sequence with saffron sparks ──────
  const handleStrike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isStreaming) { onStop(); return; }
    if (!canSend) return;

    // Emit sparks from button center
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const newSparks: Spark[] = Array.from({ length: 7 }, (_, i) => {
      // Fan left-and-upward (direction the arrow "fires")
      const angle = (-120 + i * 30) * (Math.PI / 180);
      const dist = 22 + Math.random() * 18;
      return {
        id: Date.now() + i,
        x: cx,
        y: cy,
        tx: `${(Math.cos(angle) * dist).toFixed(1)}px`,
        ty: `${(Math.sin(angle) * dist).toFixed(1)}px`,
      };
    });
    setSparks(newSparks);
    setTimeout(() => setSparks([]), 450);

    // Button animation: retract (tension) → fire → settle
    if (btnScope.current) {
      await animateBtn(btnScope.current, { x: -5, scaleX: 0.87 }, { duration: 0.07, ease: "easeIn" });
      handleSend(); // release at peak tension
      animateBtn(btnScope.current, { x: 11, scaleX: 1.07 }, { duration: 0.055, ease: "easeOut" })
        .then(() => animateBtn(btnScope.current!, { x: 0, scaleX: 1 }, { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }));
    } else {
      handleSend();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((p) => (p < COMMANDS.length - 1 ? p + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((p) => (p > 0 ? p - 1 : COMMANDS.length - 1));
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) selectCommand(activeSuggestion);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  return (
    <div className="border-t border-[#2a2244] bg-[#0c0a14]/95 relative">
      <div className="max-w-3xl mx-auto px-4 pb-4 pt-2">
      {/* Ambient gold glow that follows the cursor when the input is focused */}
      <AnimatePresence>
        {inputFocused && (
          <motion.div
            className="fixed w-[28rem] h-[28rem] rounded-full pointer-events-none z-0"
            style={{
              background: "radial-gradient(circle, rgba(212,168,67,0.07) 0%, rgba(232,101,42,0.04) 50%, transparent 70%)",
              filter: "blur(64px)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: mousePosition.x - 224,
              y: mousePosition.y - 224,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 140, mass: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Char count */}
      <AnimatePresence>
        {value.length > 200 && (
          <motion.div
            className="flex justify-end mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="type-label font-mono">{value.length} chars</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <motion.div
        className={cn(
          "relative border rounded transition-colors duration-200",
          "bg-[#16132a]",
          isStreaming
            ? "border-[#4a3f7a]"
            : inputFocused
            ? "border-[#4a3f7a] shadow-[0_0_0_1px_rgba(212,168,67,0.12)]"
            : "border-[#2a2244]",
        )}
        style={{ borderRadius: "8px" }}
      >
        {/* Command palette — floats above the input */}
        <AnimatePresence>
          {showCommandPalette && (
            <motion.div
              ref={commandPaletteRef}
              className="absolute left-0 right-0 bottom-full mb-2 bg-[#16132a] border border-[#2a2244] rounded-lg z-50 overflow-hidden"
              style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,63,122,0.3)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
            >
              {/* Palette header */}
              <div className="px-3 py-2 border-b border-[#2a2244] flex items-center gap-2">
                <Command className="w-3 h-3 text-[#8a6a20]" />
                <span className="type-overline">Quick Askings</span>
              </div>

              {COMMANDS.map((cmd, i) => (
                <motion.button
                  key={cmd.prefix}
                  type="button"
                  onClick={() => selectCommand(i)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                    activeSuggestion === i
                      ? "bg-[#1e1a38] text-[#f0e6d2]"
                      : "text-[#9b8e7a] hover:bg-[#1e1a38]/70 hover:text-[#f0e6d2]",
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex-shrink-0 transition-colors",
                      activeSuggestion === i ? "text-[#d4a843]" : "text-[#5a5066]",
                    )}
                  >
                    {cmd.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="type-body-sm font-medium text-current">{cmd.label}</span>
                      <span className="font-mono text-[0.625rem] text-[#5a5066]">{cmd.prefix}</span>
                    </div>
                    <p className="type-label mt-0.5 truncate">{cmd.description}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            disabled={isStreaming || disabled}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent outline-none",
              "text-[#f0e6d2] placeholder-[#5a5066]",
              "leading-relaxed min-h-[3.5rem] max-h-[160px]",
              "font-body text-[0.95rem]",
              "focus-visible:shadow-none focus-visible:outline-none",
              (isStreaming || disabled) && "opacity-60 cursor-not-allowed",
            )}
            style={{ overflow: "hidden" }}
            aria-label="Your question for the oracle"
          />
        </div>

        {/* Dhanush divider — separates textarea from toolbar */}
        <div className="mx-3 mb-2 dhanush-divider" />

        {/* Toolbar — command toggle + send/stop */}
        <div className="px-3 pb-3 flex items-center justify-between gap-3">
          {/* Command palette toggle */}
          <motion.button
            type="button"
            data-cmd-btn
            onClick={(e) => { e.stopPropagation(); setShowCommandPalette((p) => !p); }}
            whileTap={{ scale: 0.93 }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 border transition-colors",
              showCommandPalette
                ? "bg-[#1e1a38] text-[#d4a843] ember-glow"
                : "text-[#5a5066] hover:text-[#9b8e7a] hover:bg-[#1e1a38]",
            )}
            style={{
              border: showCommandPalette ? "1px solid #8a6a20" : "1px solid transparent",
            }}
          >
            <Command className="w-3 h-3" />
            <span className="type-overline">askings</span>
          </motion.button>

          {/* Send / Stop — talwar style when active */}
          <button
            ref={btnScope}
            type="button"
            onClick={handleStrike}
            disabled={!canSend && !isStreaming}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 transition-colors duration-200",
              isStreaming
                ? "bg-[#2a2244] text-[#9b8e7a] hover:bg-[#3a3254] hover:text-[#f0e6d2]"
                : canSend
                ? "talwar-btn text-[#0c0a14] font-semibold"
                : "bg-[#1e1a38] text-[#2a2244] cursor-not-allowed",
            )}
            aria-label={isStreaming ? "Stop response" : "Send message"}
          >
            {isStreaming ? (
              <>
                <ChakraSVG size={14} speed="fast" glowing={false} />
                <span className="type-label tracking-wider text-[#9b8e7a]">stop</span>
              </>
            ) : (
              <>
                <ArrowUp size={13} strokeWidth={2.5} />
                <span className="type-overline tracking-[0.3em]">strike</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Keyboard hint — hidden on touch devices */}
      <p className="mt-2 text-center type-label hidden sm:block">↵ send · shift+↵ newline · / commands</p>

      {/* Saffron spark particles — fixed overlay, z-top */}
      {sparks.map((s) => (
        <div
          key={s.id}
          className="spark"
          style={{
            left: s.x,
            top: s.y,
            transform: "translate(-50%, -50%)",
            ["--tx" as string]: s.tx,
            ["--ty" as string]: s.ty,
          } as React.CSSProperties}
        />
      ))}
      </div>
    </div>
  );
}

export default AnimatedAIChat;
