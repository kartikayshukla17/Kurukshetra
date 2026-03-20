import { cn } from "@/lib/utils";

// ─── Kurukshetra Medallion ─────────────────────────────────────────────────
//
// Circular gold medallion with crosshair and arrow — the main brand mark.
// Anatomy:
//   • Outer gold ring (double band)
//   • Spike crown band — 48 triangular flames between the rings
//   • Dark bronze inner disc
//   • Horizontal arrow (pointing left) + vertical line crosshair
//   • Lens-flare sparkles where the horizontal exits the ring
//   • Centre dot
//
// Square viewBox 0 0 72 72. size prop sets both width and height.

// Pre-compute the 48-spike sunburst path at module load (no runtime cost).
function buildSpikePath(): string {
  const cx = 36, cy = 36, tipR = 28.5, baseR = 23.5, N = 48;
  const half = (0.38 / N) * Math.PI * 2;
  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const aMid = (i / N) * Math.PI * 2 - Math.PI / 2;
    const x1 = (cx + Math.cos(aMid - half) * baseR).toFixed(2);
    const y1 = (cy + Math.sin(aMid - half) * baseR).toFixed(2);
    const xt = (cx + Math.cos(aMid) * tipR).toFixed(2);
    const yt = (cy + Math.sin(aMid) * tipR).toFixed(2);
    const x2 = (cx + Math.cos(aMid + half) * baseR).toFixed(2);
    const y2 = (cy + Math.sin(aMid + half) * baseR).toFixed(2);
    parts.push(`M ${x1} ${y1} L ${xt} ${yt} L ${x2} ${y2} Z`);
  }
  return parts.join(" ");
}

const SPIKE_PATH = buildSpikePath();

interface BhishmaLogoProps {
  size?: number;
  className?: string;
  glowing?: boolean;
}

export default function BhishmaLogo({
  size = 28,
  className,
  glowing = false,
}: BhishmaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(glowing && "chakra-glow", className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="kd-disc" cx="42%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#6B3210" />
          <stop offset="100%" stopColor="#200B02" />
        </radialGradient>
        {glowing && (
          <filter id="kd-glow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={glowing ? "url(#kd-glow)" : undefined}>
        {/* ── Outer ring — double band ── */}
        <circle cx="36" cy="36" r="31.5" stroke="#D4A843" strokeWidth="2.8" />
        <circle cx="36" cy="36" r="29.2" stroke="#D4A843" strokeWidth="0.5" strokeOpacity="0.35" />

        {/* ── Spike crown — 48 gold flames between rings ── */}
        <path d={SPIKE_PATH} fill="#D4A843" fillOpacity="0.88" />

        {/* ── Inner disc border ── */}
        <circle cx="36" cy="36" r="23.2" stroke="#D4A843" strokeWidth="0.7" strokeOpacity="0.45" />

        {/* ── Inner disc — dark bronze fill ── */}
        <circle cx="36" cy="36" r="22.8" fill="url(#kd-disc)" />

        {/* ── Crosshair lines ── */}
        <line x1="4" y1="36" x2="68" y2="36" stroke="#D4A843" strokeWidth="1.1" />
        <line x1="36" y1="4" x2="36" y2="68" stroke="#D4A843" strokeWidth="1.1" strokeOpacity="0.75" />

        {/* ── Arrow (pointing left) ── */}
        <path d="M 7.5 36 L 14 32 L 14 40 Z" fill="#D4A843" />
        {/* Fletching at right end */}
        <path
          d="M 62 33.5 L 67 36 L 62 38.5"
          stroke="#D4A843"
          strokeWidth="1.1"
          strokeLinejoin="round"
          fill="none"
        />

        {/* ── Tick marks where crosshair meets the inner ring ── */}
        <line x1="13.2" y1="36" x2="13.2" y2="36" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" />

        {/* ── Centre dot ── */}
        <circle cx="36" cy="36" r="2.2" fill="#F0C060" />

        {/* ── Lens-flare sparkles — left and right exits ── */}
        {/* Left */}
        <circle cx="4.5" cy="36" r="2.1" fill="#F0C060" fillOpacity="0.85" />
        <line x1="1"   y1="36" x2="8"   y2="36" stroke="#F0C060" strokeWidth="1.4" strokeOpacity="0.6" />
        <line x1="4.5" y1="33" x2="4.5" y2="39" stroke="#F0C060" strokeWidth="0.7" strokeOpacity="0.45" />
        {/* Right */}
        <circle cx="67.5" cy="36" r="2.1" fill="#F0C060" fillOpacity="0.85" />
        <line x1="64"  y1="36" x2="71"  y2="36" stroke="#F0C060" strokeWidth="1.4" strokeOpacity="0.6" />
        <line x1="67.5" y1="33" x2="67.5" y2="39" stroke="#F0C060" strokeWidth="0.7" strokeOpacity="0.45" />
      </g>
    </svg>
  );
}
