const CARD_COLORS = [
  { id: 'red', hex: 'var(--uno-red)' },
  { id: 'yellow', hex: 'var(--uno-yellow)' },
  { id: 'blue', hex: 'var(--uno-blue)' },
  { id: 'green', hex: 'var(--uno-green)' },
] as const

export function UnoCardColors({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`uno-card-row uno-card-row-${size}`} aria-hidden="true">
      {CARD_COLORS.map((color) => (
        <span key={color.id} className={`uno-card-dot uno-card-dot--${color.id}`} style={{ background: color.hex }} />
      ))}
    </div>
  )
}

export function UnoRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race" aria-hidden="true">
      {scores.map((row) => (
        <div key={row.id} className="uno-race__track">
          <span
            className="uno-race__fill"
            style={{
              width: `${Math.min(100, (row.total / threshold) * 100)}%`,
              background: row.color,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function UnoMark() {
  return (
    <svg className="uno-mark" viewBox="0 0 148 92" aria-hidden="true">
      <defs>
        <linearGradient id="unoOvalRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4d5e" />
          <stop offset="100%" stopColor="#c41028" />
        </linearGradient>
        <linearGradient id="unoWordYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3a0" />
          <stop offset="42%" stopColor="#ffd100" />
          <stop offset="100%" stopColor="#e6b000" />
        </linearGradient>
      </defs>
      <ellipse cx="74" cy="46" rx="58" ry="34" transform="rotate(-18 74 46)" fill="#111" />
      <ellipse cx="74" cy="46" rx="55" ry="31" transform="rotate(-18 74 46)" fill="url(#unoOvalRed)" />
      <ellipse
        cx="74"
        cy="46"
        rx="55"
        ry="31"
        transform="rotate(-18 74 46)"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2"
      />
      <text
        x="76"
        y="58"
        textAnchor="middle"
        fontFamily="var(--display)"
        fontSize="38"
        fontWeight="860"
        letterSpacing="1.5"
        fill="#111"
        transform="rotate(-18 74 46)"
      >
        UNO
      </text>
      <text
        x="74"
        y="56"
        textAnchor="middle"
        fontFamily="var(--display)"
        fontSize="38"
        fontWeight="860"
        letterSpacing="1.5"
        fill="url(#unoWordYellow)"
        stroke="#fff"
        strokeWidth="1.4"
        paintOrder="stroke fill"
        transform="rotate(-18 74 46)"
      >
        UNO
      </text>
    </svg>
  )
}
