import { rankLabel } from '../../game/rules.ts'
import type { SuitId } from '../../game/suits.ts'
import type { Rank } from '../../game/types.ts'
import { cornerLabel, isPipRank, PIP_LAYOUTS } from './layouts.ts'
import { SuitGlyph } from './SuitIcon.tsx'

type CardFaceGraphicProps = {
  face: Rank | 'joker'
  suitId: SuitId
  compact?: boolean
  wild?: boolean
}

const SUIT_COLORS: Record<SuitId, string> = {
  heart: '#c1121f',
  diamond: '#d62839',
  club: '#1d3557',
  spade: '#1b263b',
  star: '#b7791f',
}

export function CardFaceGraphic({ face, suitId, compact = false, wild = false }: CardFaceGraphicProps) {
  if (face === 'joker') {
    return <JokerFace compact={compact} />
  }

  const ink = SUIT_COLORS[suitId]
  const label = cornerLabel(face)

  return (
    <g className="card-face">
      <rect x="1.5" y="1.5" width="97" height="137" rx="8" fill="#fffdf8" stroke="#e7dcc6" strokeWidth="1" />
      <rect x="4" y="4" width="92" height="132" rx="6" fill="none" stroke="#f0e6d2" strokeWidth="0.6" />
      {wild ? (
        <rect x="6" y="6" width="88" height="128" rx="5" fill="none" stroke="#d4a017" strokeWidth="1" strokeDasharray="3 2" />
      ) : null}

      <CornerIndex label={label} suitId={suitId} ink={ink} x={8} y={10} />
      <CornerIndex label={label} suitId={suitId} ink={ink} x={92} y={130} rotate />

      {compact || !isPipRank(face) ? (
        <CenterFace rank={face} suitId={suitId} ink={ink} compact={compact} />
      ) : (
        <PipField rank={face} suitId={suitId} ink={ink} />
      )}
    </g>
  )
}

function CornerIndex({
  label,
  suitId,
  ink,
  x,
  y,
  rotate = false,
}: {
  label: string
  suitId: SuitId
  ink: string
  x: number
  y: number
  rotate?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) ${rotate ? 'rotate(180)' : ''}`}>
      <text x="0" y="0" fill={ink} fontSize="11" fontWeight="700" fontFamily="Georgia, 'Times New Roman', serif">
        {label}
      </text>
      <g transform="translate(0 13) translate(-5 -5)">
        <SuitGlyph suitId={suitId} scale={0.42} color={ink} />
      </g>
    </g>
  )
}

function PipField({ rank, suitId, ink }: { rank: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; suitId: SuitId; ink: string }) {
  const pips = PIP_LAYOUTS[rank]
  const scale = rank >= 9 ? 0.38 : 0.42
  return (
    <g>
      {pips.map((pip, index) => (
        <g
          key={index}
          transform={`translate(${pip.x} ${pip.y}) ${pip.flip ? 'rotate(180)' : ''} translate(${-12 * scale} ${-12 * scale})`}
        >
          <SuitGlyph suitId={suitId} scale={scale} color={ink} />
        </g>
      ))}
    </g>
  )
}

function CenterFace({
  rank,
  suitId,
  ink,
  compact,
}: {
  rank: Rank
  suitId: SuitId
  ink: string
  compact?: boolean
}) {
  if (rank >= 11) {
    const letter = rankLabel(rank)
    return (
      <g transform="translate(50 72)">
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill={ink}
          fontSize={compact ? 26 : 38}
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          {letter}
        </text>
        <g transform={`translate(${compact ? -14 : -18} ${compact ? 18 : 24})`}>
          <SuitGlyph suitId={suitId} scale={compact ? 0.5 : 0.66} color={ink} />
        </g>
        <g transform={`translate(${compact ? 8 : 10} ${compact ? -20 : -28})`}>
          <SuitGlyph suitId={suitId} scale={compact ? 0.42 : 0.58} color={ink} />
        </g>
      </g>
    )
  }

  return (
    <g transform={`translate(50 72) translate(${compact ? -9 : -13.8} ${compact ? -9 : -13.8})`}>
      <SuitGlyph suitId={suitId} scale={compact ? 0.75 : 1.15} color={ink} />
    </g>
  )
}

function JokerFace({ compact }: { compact: boolean }) {
  return (
    <g className="card-face-joker">
      <defs>
        <linearGradient id="jokerBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#2e1065" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="137" rx="8" fill="url(#jokerBg)" stroke="#c084fc" strokeWidth="1" />
      <text x="50" y="18" textAnchor="middle" fill="#fde68a" fontSize={compact ? 6 : 7} fontWeight="800" letterSpacing="1.2">
        JOKER
      </text>
      <g transform="translate(50 72)">
        <circle r={compact ? 16 : 22} fill="#7c3aed" stroke="#fde68a" strokeWidth="1.2" />
        <path
          d="M-8 -4 C-2 -12 8 -12 12 -2 C16 8 8 14 0 14 C-8 14 -16 8 -12 -2 C-10 -8 -4 -10 -8 -4 Z"
          fill="#fde68a"
        />
        <circle cx="-5" cy="-3" r="1.4" fill="#2e1065" />
        <circle cx="5" cy="-3" r="1.4" fill="#2e1065" />
        <path d="M-4 4 Q0 7 4 4" fill="none" stroke="#2e1065" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <text x="14" y="20" fill="#fde68a" fontSize="9" fontWeight="700">
        ★
      </text>
      <text x="86" y="128" fill="#fde68a" fontSize="9" fontWeight="700" transform="rotate(180 86 128)">
        ★
      </text>
    </g>
  )
}
