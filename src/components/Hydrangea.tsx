type Props = {
  className?: string;
  tone?: "lavender" | "pink" | "mixed";
};

type FloretSpec = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  color: "a" | "b";
  opacity?: number;
};

// A hydrangea "bloom" is really dozens of tiny four-petal florets packed
// into a dome. Positions are hand-placed to read as a loose, natural
// cluster rather than a perfect grid.
const florets: FloretSpec[] = [
  { x: 100, y: 42, scale: 1, rotate: 8, color: "a" },
  { x: 78, y: 50, scale: 0.9, rotate: -12, color: "b" },
  { x: 122, y: 50, scale: 0.9, rotate: 14, color: "a" },
  { x: 60, y: 66, scale: 0.95, rotate: 4, color: "a" },
  { x: 140, y: 66, scale: 0.95, rotate: -6, color: "b" },
  { x: 100, y: 66, scale: 1.05, rotate: -4, color: "b" },
  { x: 78, y: 82, scale: 1, rotate: 18, color: "b" },
  { x: 122, y: 82, scale: 1, rotate: -16, color: "a" },
  { x: 50, y: 88, scale: 0.8, rotate: 0, color: "b", opacity: 0.9 },
  { x: 150, y: 88, scale: 0.8, rotate: 0, color: "a", opacity: 0.9 },
  { x: 100, y: 92, scale: 1.1, rotate: 10, color: "a" },
  { x: 66, y: 104, scale: 0.85, rotate: -8, color: "a", opacity: 0.9 },
  { x: 134, y: 104, scale: 0.85, rotate: 8, color: "b", opacity: 0.9 },
  { x: 88, y: 110, scale: 0.9, rotate: -4, color: "b" },
  { x: 112, y: 110, scale: 0.9, rotate: 6, color: "a" },
  { x: 100, y: 118, scale: 0.8, rotate: 0, color: "b", opacity: 0.85 },
];

function Floret({ x, y, scale, rotate, fill, opacity = 1 }: {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
      opacity={opacity}
    >
      <path d="M0 -8 C 3 -6, 3 -1, 0 0 C -3 -1, -3 -6, 0 -8 Z" fill={fill} />
      <path d="M0 8 C 3 6, 3 1, 0 0 C -3 1, -3 6, 0 8 Z" fill={fill} />
      <path d="M-8 0 C -6 3, -1 3, 0 0 C -1 -3, -6 -3, -8 0 Z" fill={fill} />
      <path d="M8 0 C 6 3, 1 3, 0 0 C 1 -3, 6 -3, 8 0 Z" fill={fill} />
      <circle r="1.6" fill="var(--surface)" opacity="0.8" />
    </g>
  );
}

/**
 * Decorative hydrangea bloom built from ~16 clustered four-petal florets —
 * used as a recurring brand mark instead of a stock flower photo.
 */
export default function Hydrangea({ className, tone = "mixed" }: Props) {
  const colorA = tone === "pink" ? "var(--pink)" : "var(--lavender)";
  const colorB = tone === "lavender" ? "var(--lavender)" : "var(--pink)";

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        d="M100 200 C 98 155, 102 128, 100 100"
        stroke="var(--sage)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M100 158 C 78 153, 62 137, 65 118 C 87 118, 100 135, 100 158 Z"
        fill="var(--sage)"
        opacity="0.55"
      />
      <path
        d="M100 172 C 122 167, 137 152, 133 133 C 111 133, 100 149, 100 172 Z"
        fill="var(--sage)"
        opacity="0.55"
      />
      {florets.map((f, i) => (
        <Floret
          key={i}
          {...f}
          fill={f.color === "a" ? colorA : colorB}
          opacity={f.opacity}
        />
      ))}
    </svg>
  );
}
