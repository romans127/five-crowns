import { useMemo, useState } from 'react'
import { loadPadMode, savePadMode, type PadMode } from '../game/preferences.ts'
import { leftoverPoints, maxLeftoverCards, leftoverCardLimitReached, tallyLeftovers, wildRank } from '../game/rules.ts'
import { suitForHand } from '../game/suits.ts'
import { HAND_SIZES, type LeftoverToken, type Rank } from '../game/types.ts'
import { PlayingCard } from './PlayingCard.tsx'

type ScorePadProps = {
  playerName: string
  playerColor: string
  handIndex: number
  currentScore: number | null
  onSave: (score: number) => void
  onClose: () => void
}

const FACE_RANKS = HAND_SIZES
const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const

export function ScorePad({ playerName, playerColor, handIndex, currentScore, onSave, onClose }: ScorePadProps) {
  const wild = wildRank(handIndex)
  const maxCards = maxLeftoverCards(handIndex)
  const [mode, setMode] = useState<PadMode>(() => loadPadMode())
  const [tokens, setTokens] = useState<LeftoverToken[]>([])
  const [digits, setDigits] = useState(currentScore === null ? '' : String(currentScore))

  const cardTotal = useMemo(() => tallyLeftovers(tokens, wild), [tokens, wild])
  const keypadTotal = digits === '' ? 0 : Number(digits)
  const atCardLimit = leftoverCardLimitReached(tokens.length, handIndex)

  const selectMode = (next: PadMode) => {
    setMode(next)
    savePadMode(next)
  }

  const appendDigit = (key: string) => {
    setDigits((current) => (current + key).replace(/^0+(?=\d)/, '').slice(0, 3))
    buzz()
  }

  const backspaceDigit = () => {
    setDigits((current) => current.slice(0, -1))
    buzz()
  }

  const addRank = (rank: Rank) => {
    if (atCardLimit) {
      return
    }
    setTokens((current) => [...current, { type: 'rank', rank }])
    buzz()
  }

  const addJoker = () => {
    if (atCardLimit) {
      return
    }
    setTokens((current) => [...current, { type: 'joker' }])
    buzz()
  }

  const saveFromMode = () => {
    onSave(mode === 'cards' ? cardTotal : keypadTotal)
    buzz(24)
  }

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="score-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-pad-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <p style={{ color: playerColor }}>{playerName}</p>
          <h2 id="score-pad-title">Leftovers this hand</h2>
          <p className="pad-limit">Up to {maxCards} cards · you deal {maxCards} and discard every turn</p>
        </header>
        <div className="mode-toggle" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'cards'} onClick={() => selectMode('cards')}>
            Tap cards
          </button>
          <button type="button" role="tab" aria-selected={mode === 'keypad'} onClick={() => selectMode('keypad')}>
            Keypad
          </button>
        </div>

        {mode === 'cards' ? (
          <>
            <p className="pad-total" aria-live="polite">
              {cardTotal}
              <span>points</span>
            </p>
            <div className="token-row">
              <span className="pad-card-count" aria-live="polite">
                {tokens.length} / {maxCards} cards
              </span>
              {tokens.length === 0 ? <span className="hint">Tap every unused card</span> : null}
              {tokens.map((token, index) => (
                <PlayingCard
                  key={`${token.type}-${index}`}
                  face={token.type === 'joker' ? 'joker' : token.rank}
                  suitId={token.type === 'rank' ? suitForHand(token.rank - 3).id : 'star'}
                  size="xs"
                  wild={token.type === 'joker' || (token.type === 'rank' && token.rank === wild)}
                  pointsLabel={String(leftoverPoints(token, wild))}
                  onClick={() => setTokens(tokens.filter((_, i) => i !== index))}
                  className="token-card"
                />
              ))}
            </div>
            <div className={`card-picker ${atCardLimit ? 'card-picker-full' : ''}`}>
              {FACE_RANKS.map((rank) => (
                <PlayingCard
                  key={rank}
                  face={rank}
                  suitId={suitForHand(rank - 3).id}
                  size="sm"
                  wild={rank === wild}
                  pointsLabel={rank === wild ? '20 wild' : String(leftoverPoints({ type: 'rank', rank }, wild))}
                  onClick={atCardLimit ? undefined : () => addRank(rank)}
                />
              ))}
              <PlayingCard face="joker" size="sm" wild pointsLabel="50" onClick={atCardLimit ? undefined : addJoker} />
            </div>
          </>
        ) : (
          <>
            <p className="pad-total" aria-live="polite">
              {digits === '' ? '0' : digits}
              <span>typed score</span>
            </p>
            <div className="keypad" aria-label="Score keypad">
              {KEYPAD_ROWS.flatMap((row) =>
                row.map((key) => (
                  <button key={key} type="button" className="keypad-digit" onClick={() => appendDigit(key)}>
                    {key}
                  </button>
                )),
              )}
              <span className="keypad-spacer" aria-hidden="true" />
              <button type="button" className="keypad-digit keypad-zero" onClick={() => appendDigit('0')}>
                0
              </button>
              <button type="button" className="keypad-action" aria-label="Delete last digit" onClick={backspaceDigit}>
                ⌫
              </button>
            </div>
          </>
        )}

        <div className="sheet-actions">
          <button
            type="button"
            className="btn gold"
            onClick={() => {
              onSave(0)
              buzz(18)
            }}
          >
            Went out · 0
          </button>
          <button type="button" className="btn primary" onClick={saveFromMode}>
            Lock in {mode === 'cards' ? cardTotal : keypadTotal}
          </button>
        </div>
      </div>
    </div>
  )
}

function buzz(ms = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(ms)
  }
}
