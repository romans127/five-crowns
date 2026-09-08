export function HeartsMark({ className = 'hearts-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <rect x="6" y="8" width="84" height="56" rx="12" fill="#1a3d2c" />
      <rect x="6" y="8" width="84" height="56" rx="12" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <path
        d="M48 54 C28 40 20 30 28 20 C34 12 44 16 48 24 C52 16 62 12 68 20 C76 30 68 40 48 54 Z"
        fill="#d61f26"
      />
      <path
        d="M48 50 C32 38 26 30 32 22 C36 16 44 20 48 26 C52 20 60 16 64 22 C70 30 64 38 48 50 Z"
        fill="#ff4d57"
        opacity="0.55"
      />
      <text x="18" y="26" fontFamily="var(--display)" fontSize="13" fontWeight="800" fill="#111">
        Q
      </text>
      <path d="M18 30 L21 38 L18 36 L15 38 Z" fill="#111" />
    </svg>
  )
}

export function HeartsRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race hearts-race" aria-hidden="true">
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
