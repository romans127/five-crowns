export function GinMark({ className = 'gin-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <defs>
        <linearGradient id="ginCream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7efe4" />
          <stop offset="100%" stopColor="#e8d7c3" />
        </linearGradient>
      </defs>
      <rect x="18" y="10" width="34" height="48" rx="5" fill="url(#ginCream)" transform="rotate(-12 35 34)" />
      <rect x="18" y="10" width="34" height="48" rx="5" fill="none" stroke="#7a1f33" strokeWidth="1.6" transform="rotate(-12 35 34)" />
      <text x="28" y="28" fontFamily="var(--display)" fontSize="12" fontWeight="800" fill="#7a1f33" transform="rotate(-12 35 34)">
        A
      </text>
      <path d="M32 36 C28 32 24 34 26 38 C28 42 32 44 32 44 C32 44 36 42 38 38 C40 34 36 32 32 36 Z" fill="#7a1f33" />
      <rect x="44" y="10" width="34" height="48" rx="5" fill="url(#ginCream)" transform="rotate(10 61 34)" />
      <rect x="44" y="10" width="34" height="48" rx="5" fill="none" stroke="#7a1f33" strokeWidth="1.6" transform="rotate(10 61 34)" />
      <text x="54" y="28" fontFamily="var(--display)" fontSize="12" fontWeight="800" fill="#7a1f33" transform="rotate(10 61 34)">
        K
      </text>
      <path d="M61 34 L64 40 L61 38 L58 40 Z" fill="#7a1f33" />
    </svg>
  )
}

export function GinRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race gin-race" aria-hidden="true">
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
