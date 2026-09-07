import { useMemo, useState } from 'react'
import {
  playerColor,
  playerTotal,
  roundComplete,
  standings,
  winners,
} from './engine.ts'
import { leftoverHint, phaseLabel } from './rules.ts'
import {
  canResume,
  deleteHistoryGame,
  formatWhen,
  handsRecorded,
  historyHeadline,
  listHistory,
  searchHistory,
} from './persist.ts'
import { buildLeaderboard, sortByLastPlace, sortByWins } from './leaderboard.ts'
import { MAX_PLAYERS, MIN_PLAYERS, PHASES, PLAYER_COLORS, type Phase10Game, type Phase10Record } from './types.ts'

export function Phase10Home({
  canResume: resume,
  historyCount,
  onLeaveGames,
  onNewGame,
  onResume,
  onHistory,
  onLeaderboard,
  onRules,
}: {
  canResume: boolean
  historyCount: number
  onLeaveGames: () => void
  onNewGame: () => void
  onResume: () => void
  onHistory: () => void
  onLeaderboard: () => void
  onRules: () => void
}) {
  return (
    <section className="screen home-screen">
      <p className="eyebrow">Phase by phase</p>
      <h1>Phase 10</h1>
      <p className="tagline">Complete every phase. Leftovers still count against you.</p>
      <div className="home-actions">
        <button type="button" className="btn text" onClick={onLeaveGames}>
          All games
        </button>
        <button type="button" className="btn primary pulse" onClick={onNewGame}>
          Deal a new game
        </button>
        {resume ? (
          <button type="button" className="btn ghost" onClick={onResume}>
            Resume the table
          </button>
        ) : null}
        <button type="button" className="btn ghost" onClick={onHistory}>
          Past games{historyCount > 0 ? ` (${historyCount})` : ''}
        </button>
        <button type="button" className="btn ghost" onClick={onLeaderboard}>
          Phase board
        </button>
        <button type="button" className="btn text" onClick={onRules}>
          Look up the rules
        </button>
      </div>
    </section>
  )
}

export function Phase10Setup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <section className="screen setup-screen">
      <header className="screen-head">
        <button type="button" className="btn text" onClick={onBack}>
          Back
        </button>
        <h1>Who’s at the table?</h1>
        <p>Two to eight players. First to finish Phase 10 with the lowest leftover total wins.</p>
      </header>
      <ol className="player-fields">
        {names.map((name, index) => {
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
          return (
            <li key={`${color.id}-${index}`} className="player-field">
              <span className="seat-suit" style={{ color: color.hex }}>
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
                }}
              />
            </li>
          )
        })}
      </ol>
      {names.length < MAX_PLAYERS ? (
        <button type="button" className="btn ghost" onClick={() => setNames([...names, ''])}>
          Add a player
        </button>
      ) : null}
      <button
        type="button"
        className="btn primary"
        disabled={readyNames.length < MIN_PLAYERS}
        onClick={() => onStart(readyNames)}
      >
        Shuffle up and deal
      </button>
    </section>
  )
}

export function Phase10Play({
  game,
  onScore,
  onNextRound,
  onRules,
  onQuit,
}: {
  game: Phase10Game
  onScore: (playerId: string, leftover: number | null, completed: boolean) => void
  onNextRound: () => void
  onRules: () => void
  onQuit: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const ready = roundComplete(game)
  const leader = standings(game)[0]
  const editing = game.players.find((player) => player.id === editingId) ?? null
  const current = game.rounds[game.currentRound] ?? {}

  return (
    <section className="screen play-screen">
      <header className="play-head">
        <div>
          <p className="eyebrow">Hand {game.currentRound + 1} · 10 cards</p>
          <h1>Make your phase</h1>
        </div>
        <button type="button" className="btn text" onClick={onRules}>
          Rules
        </button>
      </header>
      {leader ? (
        <p className="hint center">
          Lowest so far: <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
        </p>
      ) : null}
      <ul className="player-scores">
        {game.players.map((player) => {
          const color = playerColor(player)
          const score = current[player.id]
          const entered = typeof score?.leftover === 'number'
          return (
            <li key={player.id}>
              <button type="button" className="player-card" onClick={() => setEditingId(player.id)}>
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
                <span className="player-meta">
                  <strong>{player.name}</strong>
                  <small>
                    {phaseLabel(player.phase)} · Total {playerTotal(game, player.id)}
                  </small>
                </span>
                <span className={`hand-score ${entered ? 'in' : 'open'}`}>
                  {entered ? score?.leftover : 'Tap'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {ready ? (
        <button type="button" className="btn primary pulse" onClick={onNextRound}>
          Next hand
        </button>
      ) : (
        <p className="hint center">Tap a player for leftovers and whether they completed this phase.</p>
      )}
      <button type="button" className="btn text quiet" onClick={onQuit}>
        Leave table
      </button>
      {editing ? (
        <Phase10Pad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          phaseLabelText={phaseLabel(editing.phase)}
          currentLeftover={current[editing.id]?.leftover ?? null}
          currentCompleted={current[editing.id]?.completed ?? false}
          onClose={() => setEditingId(null)}
          onSave={(leftover, completed) => {
            onScore(editing.id, leftover, completed)
            setEditingId(null)
          }}
        />
      ) : null}
    </section>
  )
}

function Phase10Pad({
  playerName,
  playerColor,
  phaseLabelText,
  currentLeftover,
  currentCompleted,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  phaseLabelText: string
  currentLeftover: number | null
  currentCompleted: boolean
  onSave: (leftover: number, completed: boolean) => void
  onClose: () => void
}) {
  const [digits, setDigits] = useState(currentLeftover === null ? '' : String(currentLeftover))
  const [completed, setCompleted] = useState(currentCompleted)
  const total = digits === '' ? 0 : Number(digits)

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="score-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phase10-pad-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <p style={{ color: playerColor }}>{playerName}</p>
          <h2 id="phase10-pad-title">Leftovers this hand</h2>
          <p className="pad-limit">{phaseLabelText}</p>
          <p className="pad-limit">{leftoverHint()}</p>
        </header>
        <p className="pad-total" aria-live="polite">
          {digits === '' ? '0' : digits}
          <span>leftover points</span>
        </p>
        <div className="keypad" aria-label="Score keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <button
              key={key}
              type="button"
              className="keypad-digit"
              onClick={() => setDigits((current) => (current + key).replace(/^0+(?=\d)/, '').slice(0, 3))}
            >
              {key}
            </button>
          ))}
          <span className="keypad-spacer" aria-hidden="true" />
          <button type="button" className="keypad-digit" onClick={() => setDigits((current) => (current + '0').replace(/^0+(?=\d)/, '').slice(0, 3))}>
            0
          </button>
          <button type="button" className="keypad-action" aria-label="Delete last digit" onClick={() => setDigits((current) => current.slice(0, -1))}>
            ⌫
          </button>
        </div>
        <label className="phase-complete">
          <input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />
          Completed this phase
        </label>
        <div className="sheet-actions">
          <button type="button" className="btn gold" onClick={() => onSave(0, completed)}>
            Hit out · 0
          </button>
          <button type="button" className="btn primary" onClick={() => onSave(total, completed)}>
            Lock in {total}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Phase10Rules({ onBack }: { onBack: () => void }) {
  return (
    <section className="screen rules-screen">
      <header className="screen-head">
        <button type="button" className="btn text" onClick={onBack}>
          Back to the table
        </button>
        <h1>How Phase 10 works</h1>
        <p>Complete ten phases in order. Leftover cards still add to your score.</p>
      </header>
      <article className="rule-card">
        <h2>The ten phases</h2>
        <ol className="wild-list">
          {PHASES.map((phase) => (
            <li key={phase.id}>
              <strong>Phase {phase.id}</strong>
              <span>{phase.label}</span>
            </li>
          ))}
        </ol>
      </article>
      <article className="rule-card">
        <h2>A hand</h2>
        <p>
          Deal 10 cards. Draw and discard until you can lay down your current phase, then go out. Everyone else
          gets one last turn. If you miss the phase, you try the same one next hand.
        </p>
      </article>
      <article className="rule-card">
        <h2>Scoring leftovers</h2>
        <p>{leftoverHint()}.</p>
        <p>The first player to complete Phase 10 ends the game. If more than one finishes in the same hand, lowest leftover total wins.</p>
      </article>
    </section>
  )
}

export function Phase10Winner({
  game,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: Phase10Game
  onHome: () => void
  onPlayAgain: (names: string[]) => void
  onRules: () => void
  onHistory: () => void
}) {
  const champs = winners(game)
  const rows = standings(game)
  return (
    <section className="screen winner-screen">
      <p className="eyebrow">Phase 10 complete</p>
      <h1>{champs.length > 1 ? 'Shared finish!' : 'Phase master'}</h1>
      <p className="champs">
        {champs.map((player) => (
          <span key={player.id} style={{ color: playerColor(player).hex }}>
            {player.name}
          </span>
        ))}
      </p>
      <ol className="final-standings">
        {rows.map((row, index) => (
          <li key={row.player.id}>
            <span className="place">{index + 1}</span>
            <strong style={{ color: playerColor(row.player).hex }}>{row.player.name}</strong>
            <span>{row.total}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="btn primary" onClick={() => onPlayAgain(game.players.map((player) => player.name))}>
        Same table, new deal
      </button>
      <button type="button" className="btn ghost" onClick={onHome}>
        Back home
      </button>
      <button type="button" className="btn ghost" onClick={onHistory}>
        Past games
      </button>
      <button type="button" className="btn text" onClick={onRules}>
        Review the rules
      </button>
    </section>
  )
}

export function Phase10History({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: Phase10Record) => void
}) {
  const [records, setRecords] = useState(() => listHistory())
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const filtered = useMemo(() => searchHistory(records, query), [records, query])
  const selected = records.find((record) => record.id === selectedId) ?? null

  if (selected) {
    const champs = winners(selected)
    return (
      <section className="screen history-screen">
        <header className="screen-head">
          <button type="button" className="btn text" onClick={() => setSelectedId(null)}>
            Back to history
          </button>
          <h1>Game detail</h1>
          <p>{formatWhen(selected.archivedAt)}</p>
        </header>
        <article className="history-detail-card">
          <p className="eyebrow">{selected.status === 'finished' ? 'Completed match' : 'Stopped early'}</p>
          <h2>{historyHeadline(selected)}</h2>
          {champs.length > 0 ? (
            <p className="champs compact">
              {champs.map((player) => (
                <span key={player.id} style={{ color: playerColor(player).hex }}>
                  {player.name}
                </span>
              ))}
            </p>
          ) : null}
        </article>
        {canResume(selected) ? (
          <button type="button" className="btn primary" onClick={() => onResume(selected)}>
            Resume this table
          </button>
        ) : null}
        <button
          type="button"
          className="btn text quiet"
          onClick={() => {
            deleteHistoryGame(selected.id)
            setRecords(listHistory())
            setSelectedId(null)
          }}
        >
          Delete this game
        </button>
      </section>
    )
  }

  return (
    <section className="screen history-screen">
      <header className="screen-head">
        <button type="button" className="btn text" onClick={onBack}>
          Back home
        </button>
        <h1>Past games</h1>
        <p>Search Phase 10 tables saved on this phone.</p>
        <button type="button" className="btn text" onClick={onLeaderboard}>
          Phase board
        </button>
      </header>
      <label className="history-search">
        <span className="sr-only">Search past games</span>
        <input type="search" value={query} placeholder="Search players…" onChange={(event) => setQuery(event.target.value)} />
      </label>
      {filtered.length === 0 ? (
        <p className="hint center history-empty">No saved Phase 10 games yet.</p>
      ) : (
        <ol className="history-list">
          {filtered.map((record) => (
            <li key={record.id}>
              <button type="button" className="history-row" onClick={() => setSelectedId(record.id)}>
                <span className="history-when">{formatWhen(record.archivedAt)}</span>
                <strong>{historyHeadline(record)}</strong>
                <span className="history-meta">
                  {record.status === 'finished' ? 'Completed' : `Stopped after hand ${handsRecorded(record)}`}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function Phase10Leaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <section className="screen leaderboard-screen">
      <header className="screen-head">
        <button type="button" className="btn text" onClick={onBack}>
          Back home
        </button>
        <h1>Phase board</h1>
        <p>Wins and last-place finishes from completed Phase 10 games.</p>
      </header>
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Phase 10 match and stats will show up here.</p>
      ) : (
        <>
          <article className="leaderboard-panel">
            <header>
              <h2>Most wins</h2>
            </header>
            <ol className="leaderboard-list">
              {crowns.map((entry, index) => (
                <li key={entry.name}>
                  <span className="place">{index + 1}</span>
                  <div className="leaderboard-name">
                    <strong>{entry.name}</strong>
                    <small>{entry.gamesPlayed} games</small>
                  </div>
                  <span className="leaderboard-stat gold-stat">{entry.wins}</span>
                </li>
              ))}
            </ol>
          </article>
          <article className="leaderboard-panel">
            <header>
              <h2>Most last place</h2>
            </header>
            <ol className="leaderboard-list">
              {lanterns.map((entry, index) => (
                <li key={entry.name}>
                  <span className="place">{index + 1}</span>
                  <div className="leaderboard-name">
                    <strong>{entry.name}</strong>
                    <small>{entry.gamesPlayed} games</small>
                  </div>
                  <span className="leaderboard-stat lantern-stat">{entry.lastPlace}</span>
                </li>
              ))}
            </ol>
          </article>
        </>
      )}
    </section>
  )
}
