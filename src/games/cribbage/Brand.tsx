export function CribbageMark({ className = 'crib-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <defs>
        <linearGradient id="cribWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4226" />
          <stop offset="100%" stopColor="#3d2414" />
        </linearGradient>
        <linearGradient id="cribBrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d48a" />
          <stop offset="100%" stopColor="#b8862c" />
        </linearGradient>
      </defs>
      <rect x="4" y="10" width="88" height="52" rx="10" fill="url(#cribWood)" />
      <rect x="4" y="10" width="88" height="52" rx="10" fill="none" stroke="#c4a574" strokeWidth="2.2" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <circle key={`top-${index}`} cx={16 + index * 9} cy={26} r="2.1" fill="#f4ead4" opacity="0.88" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <circle key={`bot-${index}`} cx={16 + index * 9} cy={46} r="2.1" fill="#f4ead4" opacity="0.72" />
      ))}
      <rect x="32" y="20" width="5" height="14" rx="1.6" fill="url(#cribBrass)" transform="rotate(-12 34.5 27)" />
      <circle cx="34.5" cy="19" r="3.2" fill="#f7efe0" />
      <rect x="58" y="38" width="5" height="14" rx="1.6" fill="#1f4d38" transform="rotate(10 60.5 45)" />
      <circle cx="61" cy="38" r="3.2" fill="#2e7a56" />
    </svg>
  )
}

export function CribbageRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race crib-race" aria-hidden="true">
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
