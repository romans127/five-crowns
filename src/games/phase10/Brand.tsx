const CARD_COLORS = [
  { id: 'red', hex: 'var(--p10-red)' },
  { id: 'blue', hex: 'var(--p10-blue)' },
  { id: 'green', hex: 'var(--p10-green)' },
  { id: 'yellow', hex: 'var(--p10-yellow)' },
] as const

export function PhaseCardColors({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`p10-card-row p10-card-row-${size}`} aria-hidden="true">
      {CARD_COLORS.map((color) => (
        <span key={color.id} className={`p10-card-dot p10-card-dot--${color.id}`} style={{ background: color.hex }} />
      ))}
    </div>
  )
}

export function PhaseLadder({ highlight = 10 }: { highlight?: number }) {
  return (
    <ol className="p10-phase-ladder" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => {
        const phase = index + 1
        return (
          <li key={phase} className={phase <= highlight ? 'p10-phase-ladder__step is-lit' : 'p10-phase-ladder__step'}>
            {phase}
          </li>
        )
      })}
    </ol>
  )
}

export function PhaseMark() {
  return (
    <svg className="p10-mark" viewBox="0 0 96 72" aria-hidden="true">
      <defs>
        <linearGradient id="p10MarkBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec4ff" />
          <stop offset="100%" stopColor="#2b7cff" />
        </linearGradient>
        <linearGradient id="p10MarkFan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect x="18" y="8" width="22" height="30" rx="3" fill="#e84545" transform="rotate(-14 29 23)" opacity="0.92" />
      <rect x="30" y="6" width="22" height="30" rx="3" fill="#2b7cff" transform="rotate(-4 41 21)" opacity="0.92" />
      <rect x="42" y="6" width="22" height="30" rx="3" fill="#2db86a" transform="rotate(6 53 21)" opacity="0.92" />
      <rect x="54" y="8" width="22" height="30" rx="3" fill="#f5c842" transform="rotate(16 65 23)" opacity="0.92" />
      <rect x="30" y="6" width="22" height="30" rx="3" fill="url(#p10MarkFan)" transform="rotate(-4 41 21)" />
      <text x="48" y="58" textAnchor="middle" fontFamily="var(--display)" fontSize="28" fontWeight="760" fill="url(#p10MarkBlue)">
        10
      </text>
      <text x="48" y="68" textAnchor="middle" fontFamily="var(--sans)" fontSize="7.5" fontWeight="700" letterSpacing="2.2" fill="rgba(244,247,255,0.72)">
        PHASES
      </text>
    </svg>
  )
}
