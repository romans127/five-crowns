const PAWNS = [
  { id: 'red', fill: '#e31c23', x: 20 },
  { id: 'blue', fill: '#1e5aa8', x: 38 },
  { id: 'yellow', fill: '#f5d000', x: 56 },
  { id: 'green', fill: '#2e9d4a', x: 74 },
] as const

export function SorryMark({ className = 'sorry-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <rect x="6" y="8" width="84" height="56" rx="12" fill="#f4ead4" />
      <rect x="6" y="8" width="84" height="56" rx="12" fill="none" stroke="#e31c23" strokeWidth="3" />
      <rect x="14" y="48" width="68" height="8" rx="3" fill="#1e5aa8" />
      {PAWNS.map((pawn) => (
        <g key={pawn.id}>
          <ellipse cx={pawn.x} cy="48" rx="6" ry="3.2" fill={pawn.fill} />
          <path d={`M${pawn.x - 5} 48 Q${pawn.x} 28 ${pawn.x + 5} 48`} fill={pawn.fill} />
          <circle cx={pawn.x} cy="26" r="5.2" fill={pawn.fill} />
          <circle cx={pawn.x - 1} cy="24" r="1.6" fill="#fff" opacity="0.45" />
        </g>
      ))}
    </svg>
  )
}

export function SorryRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race sorry-race" aria-hidden="true">
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
