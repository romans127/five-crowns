import { useMemo, useState } from 'react'
import { leftoverPoints, rankLabel, tallyLeftovers, wildRank } from '../game/rules.ts'
import { HAND_SIZES, type LeftoverToken, type Rank } from '../game/types.ts'

type ScorePadProps = {
  playerName: string
  playerColor: string
  handIndex: number
  currentScore: number | null
  onSave: (score: number) => void
  onClose: () => void
}

const FACE_RANKS = HAND_SIZES

type PadMode = 'cards' | 'keypad'

export function ScorePad({ playerName, playerColor, handIndex, currentScore, onSave, onClose }: ScorePadProps) {
  const wild = wildRank(handIndex)
  const [mode, setMode] = useState<PadMode>('cards')
  const [tokens, setTokens] = useState<LeftoverToken[]>([])
  const [digits, setDigits] = useState(currentScore === null ? '' : String(currentScore))

  const cardTotal = useMemo(() => tallyLeftovers(tokens, wild), [tokens, wild])
  const keypadTotal = digits === '' ? 0 : Number(digits)

  const addRank = (rank: Rank) => {
    setTokens((current) => [...current, { type: 'rank', rank }])
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
        </header>
        <div className="mode-toggle" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'cards'} onClick={() => setMode('cards')}>
            Tap cards
          </button>
          <button type="button" role="tab" aria-selected={mode === 'keypad'} onClick={() => setMode('keypad')}>
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
              {tokens.length === 0 ? <span className="hint">Tap every unused card</span> : null}
              {tokens.map((token, index) => (
                <button
                  key={`${token.type}-${index}`}
                  type="button"
                  className={`token ${token.type === 'joker' || (token.type === 'rank' && token.rank === wild) ? 'hot' : ''}`}
                  onClick={() => setTokens(tokens.filter((_, i) => i !== index))}
                >
                  {token.type === 'joker' ? 'Joker' : rankLabel(token.rank)} · {leftoverPoints(token, wild)}
                </button>
              ))}
            </div>
            <div className="rank-grid">
              {FACE_RANKS.map((rank) => (
                <button
                  key={rank}
                  type="button"
                  className={rank === wild ? 'wild-key' : ''}
                  onClick={() => addRank(rank)}
                >
                  <strong>{rankLabel(rank)}</strong>
                  <small>{rank === wild ? `${leftoverPoints({ type: 'rank', rank }, wild)} wild` : leftoverPoints({ type: 'rank', rank }, wild)}</small>
                </button>
              ))}
              <button type="button" className="joker-key" onClick={() => setTokens((current) => [...current, { type: 'joker' }])}>
                <strong>Joker</strong>
                <small>50</small>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="pad-total" aria-live="polite">
              {digits === '' ? '0' : digits}
              <span>typed score</span>
            </p>
            <div className="keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDigits((current) => (current + key).replace(/^0+(?=\d)/, '').slice(0, 3))}
                >
                  {key}
                </button>
              ))}
              <button type="button" onClick={() => setDigits((current) => current.slice(0, -1))}>
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
