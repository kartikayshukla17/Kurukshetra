import { cn } from "@/lib/utils";

// ─── Sudarshana Chakra — inline SVG spinner ───────────────────────────────
//
// Geometry (viewBox 0 0 100 100, centre 50 50):
//
//   Outer group (rotates CW):
//     • 8 triangular blades, tips at r=44, bases at r=32, spanning ±15°
//       One per 45° — the ashtadisha (8 cardinal+intercardinal directions)
//     • Outer connecting ring at r=32
//
//   Inner group (counter-rotates):
//     • 8 spokes, r=10 → r=26, offset 22.5° from blades (between each blade)
//     • Inner ring at r=20
//
//   Hub (stationary):
//     • Filled circle r=7 (gold) + centre hole r=3 (dark) = bindu point
//
// Two-layer counter-rotation creates the authentic Sudarshana Chakra effect.

interface ChakraSVGProps {
  size?: number;
  className?: string;
  glowing?: boolean;
  speed?: "normal" | "fast";
}

const BLADES = [
  // θ=0°   tip at r=44, base corners at ±15° at r=32
  "M 94,50 L 80.9,41.7 L 80.9,58.3 Z",
  // θ=45°
  "M 81.1,81.1 L 77.7,66 L 66,77.7 Z",
  // θ=90°
  "M 50,94 L 58.3,80.9 L 41.7,80.9 Z",
  // θ=135°
  "M 18.9,81.1 L 34,77.7 L 22.3,66 Z",
  // θ=180°
  "M 6,50 L 19.1,58.3 L 19.1,41.7 Z",
  // θ=225°
  "M 18.9,18.9 L 22.3,34 L 34,22.3 Z",
  // θ=270°
  "M 50,6 L 41.7,19.1 L 58.3,19.1 Z",
  // θ=315°
  "M 81.1,18.9 L 66,22.3 L 77.7,34 Z",
];

// Spoke endpoints at 22.5° offsets from blades (r=10 → r=26)
const SPOKES: [number, number, number, number][] = [
  [59.2, 53.8,  74.0, 59.9],  // φ=22.5°
  [53.8, 59.2,  59.9, 74.0],  // φ=67.5°
  [46.2, 59.2,  40.1, 74.0],  // φ=112.5°
  [40.8, 53.8,  26.0, 59.9],  // φ=157.5°
  [40.8, 46.2,  26.0, 40.1],  // φ=202.5°
  [46.2, 40.8,  40.1, 26.0],  // φ=247.5°
  [53.8, 40.8,  59.9, 26.0],  // φ=292.5°
  [59.2, 46.2,  74.0, 40.1],  // φ=337.5°
];

export default function ChakraSVG({
  size = 32,
  className,
  glowing = false,
  speed = "normal",
}: ChakraSVGProps) {
  const outerDur = speed === "fast" ? "1.4s" : "3s";
  const innerDur = speed === "fast" ? "2s"   : "4.5s";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(glowing && "chakra-glow", className)}
      aria-hidden="true"
    >
      {/* ── Outer group: blades + outer rim — rotates clockwise ── */}
      <g
        style={{
          transformOrigin: "50px 50px",
          animation: `chakra-outer ${outerDur} linear infinite`,
        }}
      >
        {/* Outer rim circle — connects blade bases */}
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="#D4A843"
          strokeWidth="0.7"
          strokeOpacity="0.45"
        />
        {/* 8 blade triangles */}
        {BLADES.map((d, i) => (
          <path key={i} d={d} fill="#D4A843" fillOpacity="0.88" />
        ))}
      </g>

      {/* ── Inner group: spokes + inner ring — counter-rotates ── */}
      <g
        style={{
          transformOrigin: "50px 50px",
          animation: `chakra-inner ${innerDur} linear infinite`,
        }}
      >
        {/* Inner ring */}
        <circle
          cx="50"
          cy="50"
          r="20"
          stroke="#D4A843"
          strokeWidth="0.6"
          strokeOpacity="0.35"
        />
        {/* 8 spokes */}
        {SPOKES.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D4A843"
            strokeWidth="0.9"
            strokeOpacity="0.55"
          />
        ))}
      </g>

      {/* ── Stationary hub: bindu point ── */}
      <circle cx="50" cy="50" r="7" fill="#D4A843" />
      <circle cx="50" cy="50" r="2.8" fill="#0C0A14" />
    </svg>
  );
}
