const SUITS = [
  { symbol: '★', className: 'suit-star' },
  { symbol: '♥', className: 'suit-heart' },
  { symbol: '♣', className: 'suit-club' },
  { symbol: '♠', className: 'suit-spade' },
  { symbol: '♦', className: 'suit-diamond' },
] as const

export function SuitRow({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`suit-row suit-row-${size}`} aria-hidden="true">
      {SUITS.map((suit) => (
        <span key={suit.symbol} className={suit.className}>
          {suit.symbol}
        </span>
      ))}
    </div>
  )
}

export function CrownMark() {
  return (
    <svg className="crown-mark" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M8 44 L12 20 L24 34 L32 12 L40 34 L52 20 L56 44 Z"
        fill="url(#crownGold)"
        stroke="#f6e7b2"
        strokeWidth="2"
      />
      <rect x="10" y="44" width="44" height="8" rx="2" fill="#f4c95d" />
      <circle cx="12" cy="20" r="3" fill="#ff4d6d" />
      <circle cx="32" cy="12" r="3.5" fill="#ffd166" />
      <circle cx="52" cy="20" r="3" fill="#7aa2ff" />
      <defs>
        <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a0" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
      </defs>
    </svg>
  )
}
