import type { SuitId } from '../../game/suits.ts'

type SuitGlyphProps = {
  suitId: SuitId
  scale?: number
  color?: string
}

export function SuitGlyph({ suitId, scale = 1, color = 'currentColor' }: SuitGlyphProps) {
  return (
    <g fill={color} transform={`scale(${scale})`}>
      {suitId === 'heart' ? <HeartPath /> : null}
      {suitId === 'diamond' ? <DiamondPath /> : null}
      {suitId === 'club' ? <ClubPath /> : null}
      {suitId === 'spade' ? <SpadePath /> : null}
      {suitId === 'star' ? <StarPath /> : null}
    </g>
  )
}

function HeartPath() {
  return (
    <path d="M12 21 C12 21 3 14 3 9 C3 6 5.5 4 8 4 C9.8 4 11 5.2 12 6.5 C13 5.2 14.2 4 16 4 C18.5 4 21 6 21 9 C21 14 12 21 12 21 Z" />
  )
}

function DiamondPath() {
  return <path d="M12 2 L22 12 L12 22 L2 12 Z" />
}

function ClubPath() {
  return (
    <>
      <circle cx="12" cy="8.5" r="4.2" />
      <circle cx="7" cy="13.5" r="4.2" />
      <circle cx="17" cy="13.5" r="4.2" />
      <path d="M10 17 H14 V21 H12 V19 H10 Z" />
    </>
  )
}

function SpadePath() {
  return (
    <>
      <path d="M12 3 C8 8 4 10 4 14 C4 17 6.5 19 9 19 C10.5 19 11.5 18.2 12 17.2 C12.5 18.2 13.5 19 15 19 C17.5 19 20 17 20 14 C20 10 16 8 12 3 Z" />
      <path d="M10 19 H14 V21 H12 V19 H10 Z" />
    </>
  )
}

function StarPath() {
  return (
    <path d="M12 2 L14.8 9.2 L22.5 9.8 L16.6 14.5 L18.6 22 L12 18 L5.4 22 L7.4 14.5 L1.5 9.8 L9.2 9.2 Z" />
  )
}

/** HTML wrapper for places outside the main card SVG. */
export function SuitIcon({ suitId, size = 12, color = 'currentColor' }: { suitId: SuitId; size?: number; color?: string }) {
  const scale = size / 24
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <SuitGlyph suitId={suitId} scale={scale} color={color} />
    </svg>
  )
}
