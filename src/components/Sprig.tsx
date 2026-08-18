export default function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true">
      <path
        d="M2 20 C 30 8, 90 8, 118 20"
        stroke="var(--sage)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.55"
      />
      <path d="M28 15 C 24 9, 16 9, 12 14 C 18 18, 24 18, 28 15 Z" fill="var(--sage)" opacity="0.5" />
      <path d="M52 22 C 48 16, 40 16, 36 21 C 42 25, 48 25, 52 22 Z" fill="var(--sage)" opacity="0.5" />
      <path d="M78 14 C 82 8, 90 8, 94 13 C 88 17, 82 17, 78 14 Z" fill="var(--sage)" opacity="0.5" />
      <circle cx="60" cy="20" r="3" fill="var(--pink)" opacity="0.7" />
    </svg>
  );
}
