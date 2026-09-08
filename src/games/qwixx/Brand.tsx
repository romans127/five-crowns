const ROWS = [
  { id: 'red', fill: '#e31c23' },
  { id: 'yellow', fill: '#f5c400' },
  { id: 'green', fill: '#1f9d55' },
  { id: 'blue', fill: '#2b6cff' },
] as const

export function QwixxMark({ className = 'qwixx-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <rect x="6" y="8" width="84" height="56" rx="12" fill="#14161c" />
      {ROWS.map((row, index) => (
        <g key={row.id}>
          <rect x="14" y={16 + index * 12} width="68" height="9" rx="3" fill={row.fill} />
          <path
            d="M20 18.5 L24 23.5 M24 18.5 L20 23.5"
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity={index < 3 ? 0.95 : 0.45}
          />
          <path
            d="M32 18.5 L36 23.5 M36 18.5 L32 23.5"
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity={index < 2 ? 0.9 : 0.28}
          />
        </g>
      ))}
    </svg>
  )
}

export function QwixxRows({
  red,
  yellow,
  green,
  blue,
}: {
  red: number
  yellow: number
  green: number
  blue: number
}) {
  const rows = [
    { id: 'red', count: red, fill: 'var(--qx-red, #e31c23)' },
    { id: 'yellow', count: yellow, fill: 'var(--qx-yellow, #f5c400)' },
    { id: 'green', count: green, fill: 'var(--qx-green, #1f9d55)' },
    { id: 'blue', count: blue, fill: 'var(--qx-blue, #2b6cff)' },
  ] as const

  return (
    <div className="qx-row-preview" aria-hidden="true">
      {rows.map((row) => (
        <span key={row.id} className="qx-row-preview__bar" style={{ background: row.fill }}>
          {row.count}
        </span>
      ))}
    </div>
  )
}
