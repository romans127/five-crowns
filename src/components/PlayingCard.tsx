import { rankLabel } from '../game/rules.ts'
import { SUITS, type SuitId } from '../game/suits.ts'
import type { Rank } from '../game/types.ts'
import { CardFaceGraphic } from './card-art/CardFaceGraphic.tsx'

export type CardFace = Rank | 'joker'

type PlayingCardProps = {
  face: CardFace
  suitId?: SuitId
  size?: 'xs' | 'sm' | 'md'
  wild?: boolean
  active?: boolean
  done?: boolean
  dealCount?: number
  pointsLabel?: string
  onClick?: () => void
  className?: string
  tabRole?: 'tab'
  tabSelected?: boolean
}

function suitById(id: SuitId) {
  return SUITS.find((suit) => suit.id === id) ?? SUITS[0]!
}

function faceLabel(face: CardFace): string {
  return face === 'joker' ? 'Joker' : rankLabel(face)
}

export function PlayingCard({
  face,
  suitId = 'star',
  size = 'sm',
  wild = false,
  active = false,
  done = false,
  dealCount,
  pointsLabel,
  onClick,
  className = '',
  tabRole,
  tabSelected,
}: PlayingCardProps) {
  const suit = suitById(suitId)
  const label = faceLabel(face)
  const isJoker = face === 'joker'
  const compact = size === 'xs'
  const classes = [
    'playing-card',
    `playing-card-${size}`,
    isJoker ? 'playing-card-joker' : `playing-card-${suit.tone}`,
    wild ? 'playing-card-wild' : '',
    active ? 'playing-card-active' : '',
    done ? 'playing-card-done' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      <svg className="pc-art" viewBox="0 0 100 140" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <CardFaceGraphic face={face} suitId={suitId} compact={compact} wild={wild && !isJoker} />
      </svg>
      {typeof dealCount === 'number' ? (
        <span className="pc-deal-count" aria-hidden="true">
          {dealCount}
        </span>
      ) : null}
      {pointsLabel ? <span className="pc-points">{pointsLabel}</span> : null}
    </>
  )

  const aria = isJoker
    ? `Joker${pointsLabel ? `, ${pointsLabel}` : ''}`
    : `${label} of ${suit.name}${wild ? ', wild' : ''}${pointsLabel ? `, ${pointsLabel}` : ''}${typeof dealCount === 'number' ? `, ${dealCount} cards dealt` : ''}`

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        aria-label={aria}
        role={tabRole}
        aria-selected={tabRole ? tabSelected : undefined}
        onClick={onClick}
      >
        {body}
      </button>
    )
  }

  return (
    <div className={classes} aria-hidden="true">
      {body}
    </div>
  )
}
