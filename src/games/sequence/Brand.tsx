const CHIPS = [
  { id: 'blue', fill: '#2b6cff', x: 28 },
  { id: 'green', fill: '#1f9d55', x: 48 },
  { id: 'red', fill: '#e31c23', x: 68 },
] as const

export function SequenceMark({ className = 'seq-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <rect x="6" y="8" width="84" height="56" rx="12" fill="#163528" />
      <rect x="6" y="8" width="84" height="56" rx="12" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      {[0, 1, 2, 3].map((col) =>
        [0, 1].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={16 + col * 16}
            y={16 + row * 18}
            width="13"
            height="15"
            rx="2"
            fill="#f4ead4"
            opacity="0.92"
          />
        )),
      )}
      {CHIPS.map((chip) => (
        <g key={chip.id}>
          <circle cx={chip.x} cy={chip.id === 'green' ? 42 : 34} r="8" fill={chip.fill} />
          <circle cx={chip.x - 2} cy={chip.id === 'green' ? 39 : 31} r="2.2" fill="#fff" opacity="0.35" />
        </g>
      ))}
    </svg>
  )
}

export function SequenceRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race seq-race" aria-hidden="true">
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
