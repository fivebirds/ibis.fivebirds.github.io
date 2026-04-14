// ─── Ibis SVG ─────────────────────────────────────────────────────────────────
function IbisSvg({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="Ibis — sacred bird of Thoth, keeper of human wisdom"
    >
      <ellipse cx="60" cy="80" rx="18" ry="22" opacity="0.95" />
      <path d="M60 58 Q52 38 38 22 Q34 16 30 20 Q28 24 34 26 Q42 30 50 44 Q55 52 60 58Z" />
      <path d="M42 75 Q20 60 10 68 Q18 78 42 82Z" />
      <path d="M78 75 Q100 60 110 68 Q102 78 78 82Z" />
      <path d="M52 100 Q60 112 68 100 Q64 94 60 96 Q56 94 52 100Z" />
      <circle cx="40" cy="23" r="2.5" fill="white" />
    </svg>
  )
}

export default IbisSvg