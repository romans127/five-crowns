import { useEffect, useMemo, useRef, useState } from 'react'
import { handComplete, playerColor, playerTotal, standings } from '../game/engine.ts'
import { cardsDealt, handTitle, wildLabel, wildRank } from '../game/rules.ts'
import { suitForHand } from '../game/suits.ts'
import { HAND_SIZES, type Game } from '../game/types.ts'
import { PrimaryButton, TextButton } from '../platform/IosChrome.tsx'
import { PlayingCard } from './PlayingCard.tsx'
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
  const handTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = handTrackRef.current
    if (!track) {
      return
    }
    const active = track.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }, [current])

  return (
    <section className="screen play-screen">
      <header className="play-head">
        <div>
          <p className="eyebrow">{handTitle(current)}</p>
          <h1>
            <span className="wild-burst">{wildLabel(current)}</span> are wild
          </h1>
        </div>
        <TextButton onClick={onRules}>Rules</TextButton>
      </header>

      <div className="hand-track" ref={handTrackRef} role="tablist" aria-label="Hands">
        {HAND_SIZES.map((size, index) => {
          const done = handComplete(game, index)
          const suit = suitForHand(index)
          return (
            <PlayingCard
              key={size}
              face={wildRank(index)}
              suitId={suit.id}
              size="xs"
              wild
              active={index === current}
              done={done}
              dealCount={cardsDealt(index)}
              tabRole="tab"
              tabSelected={index === current}
              onClick={() => onSelectHand(index)}
              className="hand-round-card"
            />
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
        <PrimaryButton className="pulse" onClick={onNextHand}>
          {lastHand ? 'Crown a winner' : 'Next hand — deal one more'}
        </PrimaryButton>
      ) : (
        <p className="hint center frost-tile">Tap a player as they count leftovers (up to {cardsDealt(current)} cards).</p>
      )}

      <TextButton className="quiet" onClick={onQuit}>
        Leave table
      </TextButton>

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
