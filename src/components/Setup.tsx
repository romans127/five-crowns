import { useState } from 'react'
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS } from '../game/types.ts'
import { GlassButton, PrimaryButton, TextButton } from '../platform/IosChrome.tsx'

type SetupProps = {
  onBack: () => void
  onStart: (names: string[]) => void
}

const STARTERS = ['', '']

export function Setup({ onBack, onStart }: SetupProps) {
  const [names, setNames] = useState<string[]>(STARTERS)
  const [error, setError] = useState<string | null>(null)

  const readyNames = names.map((name) => name.trim()).filter(Boolean)
  const canStart = readyNames.length >= MIN_PLAYERS

  return (
    <section className="screen setup-screen">
      <header className="screen-head">
        <TextButton onClick={onBack}>Back</TextButton>
        <h1>Who’s at the table?</h1>
        <p>Two to eight players. Lowest leftover points after 11 hands wins.</p>
      </header>
      <ol className="player-fields">
        {names.map((name, index) => {
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
          return (
            <li key={color.id + index} className="player-field">
              <span className="seat-suit" style={{ color: color.hex }} aria-hidden="true">
                {color.suit}
              </span>
              <input
                value={name}
                maxLength={18}
                autoCapitalize="words"
                placeholder={`Player ${index + 1}`}
                aria-label={`Player ${index + 1} name`}
                onChange={(event) => {
                  const next = [...names]
                  next[index] = event.target.value
                  setNames(next)
                  setError(null)
                }}
              />
              {names.length > MIN_PLAYERS ? (
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove player ${index + 1}`}
                  onClick={() => setNames(names.filter((_, i) => i !== index))}
                >
                  ✕
                </button>
              ) : null}
            </li>
          )
        })}
      </ol>
      {names.length < MAX_PLAYERS ? (
        <GlassButton onClick={() => setNames([...names, ''])}>Add a player</GlassButton>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
      <PrimaryButton
        disabled={!canStart}
        onClick={() => {
          if (!canStart) {
            setError('Need at least two names to deal.')
            return
          }
          onStart(readyNames)
        }}
      >
        Shuffle up and deal
      </PrimaryButton>
    </section>
  )
}
