"use client";

import { useState, useEffect } from "react";
import ChakraSVG from "@/components/ui/ChakraSVG";

const FACTS = [
  "The Mahabharata is the longest poem ever written — over 100,000 shlokas, nearly 1.8 million words.",
  "Krishna never commands Arjuna to win. He commands him only to act — without attachment to the fruit.",
  "Vyasa is both the author of the Mahabharata and a character within it. He dictated it to Ganesha.",
  "Ganesha agreed to transcribe the Mahabharata on one condition: Vyasa must never pause. Vyasa countered: Ganesha must never write without understanding each verse first.",
  "Krishna declares he is born in every age — not to punish the wicked, but to restore the forgotten purpose of life.",
  "Karna was the eldest Pandava, born to Kunti before her marriage to Pandu. He never knew this until the war had already begun.",
  "Draupadi is the only character in the epic described as born fully grown from fire — she had no childhood.",
  "Krishna reveals his cosmic form to Arjuna: 'I am Time, the great destroyer of worlds, and I have come here to slay these men.'",
  "Bhishma lay on a bed of arrows for 58 days, waiting for the auspicious moment to die. He chose the hour of his own death.",
  "The Gita teaches that the self is both its own greatest friend and its own greatest enemy — the same mind that liberates can also imprison.",
  "The Kurukshetra war lasted only 18 days, yet the Mahabharata spends most of its length on what came before and after.",
  "Ashwatthama, Kripa, and Kripacharya are said to be immortal — they still walk the earth, burdened by what they witnessed.",
  "The last counsel of Krishna: abandon all forms of dharma and surrender to him alone. The entire Gita builds to this single verse.",
  "Yudhishthira walked into heaven with a dog, refusing to abandon it. The dog was Dharma in disguise — his own father, testing him one last time.",
];

// Pick a random starting index once per mount
function randomIndex() {
  return Math.floor(Math.random() * FACTS.length);
}

export default function TypingIndicator() {
  const [idx, setIdx] = useState(randomIndex);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out, swap fact, fade in
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % FACTS.length);
        setVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const fact = FACTS[idx];

  return (
    <div
      className="flex items-start gap-3"
      style={{ animation: "fade-up 0.25s ease-out forwards" }}
      aria-label="The charioteer is responding"
      role="status"
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-[#16132a] mt-1"
        style={{ border: "1px solid #8a6a20" }}
      >
        <span className="text-[#d4a843] ember-glow text-xs" aria-hidden>◉</span>
      </div>

      {/* Bubble with smoke wisps */}
      <div
        className="relative hammered-bronze flex flex-col gap-2 px-5 py-4 overflow-hidden"
        style={{ minWidth: "260px", maxWidth: "480px" }}
      >
        {/* Smoke wisps */}
        <span
          className="smoke-wisp"
          style={{ left: "20%", bottom: 0, ["--wx" as string]: "8px", ["--dur" as string]: "2.1s" } as React.CSSProperties}
          aria-hidden
        />
        <span
          className="smoke-wisp"
          style={{ left: "50%", bottom: 0, ["--wx" as string]: "-6px", ["--dur" as string]: "2.6s", animationDelay: "0.7s" } as React.CSSProperties}
          aria-hidden
        />
        <span
          className="smoke-wisp"
          style={{ left: "75%", bottom: 0, ["--wx" as string]: "10px", ["--dur" as string]: "1.9s", animationDelay: "1.3s" } as React.CSSProperties}
          aria-hidden
        />

        {/* Top row: spinner + label */}
        <div className="relative z-10 flex items-center gap-2">
          <ChakraSVG size={16} glowing speed="normal" />
          <span
            className="type-overline"
            style={{ color: "#8a6a20", letterSpacing: "0.12em" }}
          >
            Did you know
          </span>
        </div>

        {/* Fact text */}
        <p
          className="relative z-10 italic leading-snug"
          style={{
            fontFamily: "'Spectral', Georgia, serif",
            fontSize: "0.9rem",
            color: "#c8b890",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          {fact}
        </p>
      </div>
    </div>
  );
}
