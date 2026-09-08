export function DealMark({ className = 'deal-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <defs>
        <linearGradient id="dealRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff3b3b" />
          <stop offset="100%" stopColor="#b10d16" />
        </linearGradient>
        <linearGradient id="dealGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e27a" />
          <stop offset="100%" stopColor="#c4922a" />
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="80" height="52" rx="12" fill="#111" />
      <rect x="11" y="13" width="74" height="46" rx="10" fill="url(#dealRed)" />
      <rect x="11" y="13" width="74" height="46" rx="10" fill="none" stroke="#f4ead4" strokeWidth="2" />
      <circle cx="32" cy="36" r="12" fill="url(#dealGold)" />
      <text x="32" y="41" textAnchor="middle" fontFamily="var(--display)" fontSize="13" fontWeight="800" fill="#5a3208">
        $
      </text>
      <rect x="50" y="22" width="26" height="8" rx="2" fill="#111" />
      <circle cx="63" cy="22" r="5" fill="#111" />
      <circle cx="63" cy="20" r="3.2" fill="#f4ead4" />
      <path d="M54 32 H76 V48 H54 Z" fill="#f4ead4" />
      <path d="M57 35 H73 V38 H57 Z" fill="#111" />
      <path d="M57 41 H70 V44 H57 Z" fill="#d4a017" />
    </svg>
  )
}

export function DealRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race deal-race" aria-hidden="true">
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
