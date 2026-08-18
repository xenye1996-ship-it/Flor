"use client";

import { motion, useReducedMotion } from "framer-motion";

type Petal = {
  left: string;
  size: number;
  duration: number;
  delay: number;
  tone: "lavender" | "pink";
  drift: number;
};

const petals: Petal[] = [
  { left: "6%", size: 14, duration: 16, delay: 0, tone: "pink", drift: 30 },
  { left: "18%", size: 10, duration: 21, delay: 3, tone: "lavender", drift: -24 },
  { left: "34%", size: 16, duration: 18, delay: 6, tone: "lavender", drift: 20 },
  { left: "52%", size: 11, duration: 24, delay: 1, tone: "pink", drift: -18 },
  { left: "68%", size: 13, duration: 19, delay: 8, tone: "lavender", drift: 26 },
  { left: "82%", size: 15, duration: 22, delay: 4, tone: "pink", drift: -22 },
  { left: "92%", size: 10, duration: 17, delay: 10, tone: "lavender", drift: 16 },
];

/** A handful of hydrangea petals drifting slowly down the hero — pure ambience, not a focal point. */
export default function Petals() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-[-40px] rounded-[60%_40%_60%_40%]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.3,
            background:
              p.tone === "pink" ? "var(--pink)" : "var(--lavender)",
            opacity: 0.35,
          }}
          animate={{
            y: ["-5vh", "105vh"],
            x: [0, p.drift, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
