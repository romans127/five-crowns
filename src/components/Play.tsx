import { useMemo, useState } from 'react'
import { handComplete, playerColor, playerTotal, standings } from '../game/engine.ts'
import { cardsDealt, handTitle, wildLabel } from '../game/rules.ts'
import { HAND_SIZES, type Game } from '../game/types.ts'
import { ScorePad } from './ScorePad.tsx'
import { SuitRow } from './Suits.tsx'

type PlayProps = {
  game: Game
  onScore: (handIndex: number, playerId: string, score: number | null) => void
  onNextHand: () => void
  onSelectHand: (handIndex: number) => void
  onRules: () => void
  onQuit: () => void
}

export function Play({ game, onScore, onNextHand, onSelectHand, onRules, onQuit }: PlayProps) {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const current = game.currentHand
  const ready = handComplete(game, current)
  const lastHand = current === HAND_SIZES.length - 1
  const ranked = useMemo(() => standings(game), [game])
  const leader = ranked[0]
  const editingPlayer = game.players.find((player) => player.id === editingPlayerId) ?? null

  return (
    <section className="screen play-screen">
      <header className="play-head">
        <div>
          <p className="eyebrow">{handTitle(current)}</p>
          <h1>
            <span className="wild-burst">{wildLabel(current)}</span> are wild
          </h1>
        </div>
        <button type="button" className="btn text" onClick={onRules}>
          Rules
        </button>
      </header>

      <div className="hand-track" role="tablist" aria-label="Hands">
        {HAND_SIZES.map((size, index) => {
          const done = handComplete(game, index)
          return (
            <button
              key={size}
              type="button"
              role="tab"
              aria-selected={index === current}
              className={`crown-step ${done ? 'done' : ''} ${index === current ? 'active' : ''}`}
              onClick={() => onSelectHand(index)}
            >
              <span>{cardsDealt(index)}</span>
            </button>
          )
        })}
      </div>

      <div className="leader-strip">
        <SuitRow size="sm" />
        {leader ? (
          <p>
            Crown so far: <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
          </p>
        ) : null}
      </div>

      <ul className="player-scores">
        {game.players.map((player) => {
          const color = playerColor(player)
          const handScore = game.scores[current]?.[player.id]
          const entered = typeof handScore === 'number'
          return (
            <li key={player.id}>
              <button type="button" className="player-card" onClick={() => setEditingPlayerId(player.id)}>
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
                <span className="player-meta">
                  <strong>{player.name}</strong>
                  <small>Total {playerTotal(game, player.id)}</small>
                </span>
                <span className={`hand-score ${entered ? 'in' : 'open'}`}>{entered ? handScore : 'Tap'}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {ready ? (
        <button type="button" className="btn primary pulse" onClick={onNextHand}>
          {lastHand ? 'Crown a winner' : 'Next hand — deal one more'}
        </button>
      ) : (
        <p className="hint center">Tap a player as they count leftovers.</p>
      )}

      <button type="button" className="btn text quiet" onClick={onQuit}>
        Leave table
      </button>

      {editingPlayer ? (
        <ScorePad
          playerName={editingPlayer.name}
          playerColor={playerColor(editingPlayer).hex}
          handIndex={current}
          currentScore={game.scores[current]?.[editingPlayer.id] ?? null}
          onClose={() => setEditingPlayerId(null)}
          onSave={(score) => {
            onScore(current, editingPlayer.id, score)
            setEditingPlayerId(null)
          }}
        />
      ) : null}
    </section>
  )
}
