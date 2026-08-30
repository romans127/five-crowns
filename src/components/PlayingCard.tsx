import { rankLabel } from '../game/rules.ts'
import { SUITS, type SuitId } from '../game/suits.ts'
import type { Rank } from '../game/types.ts'

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
  const classes = [
    'playing-card',
    `playing-card-${size}`,
    `playing-card-${suit.tone}`,
    isJoker ? 'playing-card-joker' : '',
    wild ? 'playing-card-wild' : '',
    active ? 'playing-card-active' : '',
    done ? 'playing-card-done' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      {!isJoker ? (
        <>
          <span className="pc-corner pc-corner-tl" aria-hidden="true">
            <strong>{label}</strong>
            <small>{suit.symbol}</small>
          </span>
          <span className="pc-center" aria-hidden="true">
            {label}
            <small>{suit.symbol}</small>
          </span>
          <span className="pc-corner pc-corner-br" aria-hidden="true">
            <strong>{label}</strong>
            <small>{suit.symbol}</small>
          </span>
        </>
      ) : (
        <>
          <span className="pc-joker-top" aria-hidden="true">
            JOKER
          </span>
          <span className="pc-joker-face" aria-hidden="true">
            ★
          </span>
        </>
      )}
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
