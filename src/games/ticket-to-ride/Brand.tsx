export function TtrMark({ className = 'ttr-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <defs>
        <linearGradient id="ttrTicket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="100%" stopColor="#e6b800" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="84" height="52" rx="12" fill="#2c2218" />
      <path d="M10 36 C22 22 34 48 48 34 C62 20 74 46 86 32" fill="none" stroke="#8d6e4c" strokeWidth="2.2" />
      <rect x="14" y="18" width="40" height="24" rx="4" fill="url(#ttrTicket)" transform="rotate(-12 34 30)" />
      <text
        x="34"
        y="34"
        textAnchor="middle"
        fontFamily="var(--display)"
        fontSize="9"
        fontWeight="800"
        fill="#5a3208"
        transform="rotate(-12 34 30)"
      >
        TICKET
      </text>
      <rect x="48" y="38" width="34" height="16" rx="4" fill="#c41e3a" />
      <circle cx="56" cy="56" r="5" fill="#1a1a1a" />
      <circle cx="74" cy="56" r="5" fill="#1a1a1a" />
      <circle cx="56" cy="56" r="2" fill="#f2d15c" />
      <circle cx="74" cy="56" r="2" fill="#f2d15c" />
      <rect x="70" y="32" width="12" height="10" rx="2" fill="#c41e3a" />
    </svg>
  )
}

export function TtrRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  const max = Math.max(threshold, ...scores.map((row) => row.total), 1)
  return (
    <div className="uno-race ttr-race" aria-hidden="true">
      {scores.map((row) => (
        <div key={row.id} className="uno-race__track">
          <span
            className="uno-race__fill"
            style={{
              width: `${Math.min(100, (row.total / max) * 100)}%`,
              background: row.color,
            }}
          />
        </div>
      ))}
    </div>
  )
}
