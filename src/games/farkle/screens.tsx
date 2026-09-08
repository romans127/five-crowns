import { Button, ListRow, ListSection, SearchBar, Sheet, Toggle } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton, TintedButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { FarkleMark, FarkleRace } from './Brand.tsx'
import {
  canCallGame,
  playerColor,
  playerTotal,
  roundComplete,
  roundPoints,
  standings,
  winners,
  wouldFinish,
} from './engine.ts'
import { scoreHint, scoreLegend, winConditionCopy } from './rules.ts'
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
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type FarkleGame, type FarkleRecord } from './types.ts'

export function FarkleHome({
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
    <SceneShell
      className="home-screen"
      nav={{
        back: { label: 'All games', onClick: onLeaveGames },
        title: 'Farkle',
        subtitle: 'Bank 10,000',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Hot dice', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <FarkleMark />
        <p className="eyebrow">Bank or bust</p>
        <h2 className="hero-display">Farkle</h2>
        <p className="tagline">Roll real dice. Bank the turn, or farkle for zero, on the way to 10,000.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Start a new pot
        </PrimaryButton>
        <ActionList items={[...(resume ? [{ label: 'Resume the table', onClick: onResume }] : [])]} />
      </div>
    </SceneShell>
  )
}

export function FarkleSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Farkle', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s rolling?',
      }}
    >
      <p className="hint">Two to eight players. Enter banked points each turn. A farkle is 0.</p>
      <ListSection header="Players" className="player-fields">
        {names.map((name, index) => {
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
          return (
            <PlayerNameField
              key={`${color.id}-${index}`}
              index={index}
              name={name}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              canRemove={names.length > MIN_PLAYERS}
              onChange={(value) => {
                const next = [...names]
                next[index] = value
                setNames(next)
              }}
              onRemove={() => {
                setNames(names.filter((_, playerIndex) => playerIndex !== index))
              }}
            />
          )
        })}
      </ListSection>
      {names.length < MAX_PLAYERS ? (
        <GlassButton onClick={() => setNames([...names, ''])}>Add a player</GlassButton>
      ) : null}
      <PrimaryButton disabled={readyNames.length < MIN_PLAYERS} onClick={() => onStart(readyNames)}>
        Roll the first turn
      </PrimaryButton>
    </SceneShell>
  )
}

export function FarklePlay({
  game,
  onBack,
  onScore,
  onNextRound,
  onCallGame,
  onRules,
  onQuit,
}: {
  game: FarkleGame
  onBack: () => void
  onScore: (playerId: string, points: number | null, farkle: boolean) => void
  onNextRound: () => void
  onCallGame: () => void
  onRules: () => void
  onQuit: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const ready = roundComplete(game)
  const leader = standings(game)[0]
  const editing = game.players.find((player) => player.id === editingId) ?? null
  const current = game.rounds[game.currentRound] ?? {}
  const finishReady = wouldFinish(game)

  return (
    <SceneShell
      className="play-screen"
      nav={{
        back: { label: 'Farkle', onClick: onBack },
        title: `Turn ${game.currentRound + 1}`,
        subtitle: `First to ${game.winThreshold.toLocaleString()}`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Bank the dice</h1>
      <FarkleRace
        threshold={game.winThreshold}
        scores={game.players.map((player) => ({
          id: player.id,
          total: playerTotal(game, player.id),
          color: playerColor(player).hex,
        }))}
      />
      {leader ? (
        <p className="hint center frost-tile">
          Closest to {game.winThreshold.toLocaleString()}:{' '}
          <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total.toLocaleString()}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const score = current[player.id]
          const entered = typeof score?.points === 'number'
          const awarded = ready ? roundPoints(game, game.currentRound, player.id) : null
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={
                awarded !== null
                  ? `Total ${playerTotal(game, player.id).toLocaleString()} · +${awarded.toLocaleString()} this turn`
                  : `Total ${playerTotal(game, player.id).toLocaleString()} · race to ${game.winThreshold.toLocaleString()}`
              }
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={score?.farkle ? 'Farkle' : entered ? score?.points ?? 'Tap' : 'Tap'}
              entered={entered}
              separator={index < game.players.length - 1}
              onClick={() => setEditingId(player.id)}
            />
          )
        })}
      </ListSection>
      {ready ? (
        <PrimaryButton className="pulse" onClick={onNextRound}>
          {finishReady ? 'See the winner' : 'Next turn'}
        </PrimaryButton>
      ) : (
        <p className="hint center frost-tile">Tap a player to bank the turn — or mark a farkle for zero.</p>
      )}
      <TextButton className="quiet" onClick={onQuit}>
        Leave table
      </TextButton>
      {canCallGame(game) ? (
        <TextButton className="quiet" onClick={onCallGame}>
          Call the game
        </TextButton>
      ) : null}
      {editing ? (
        <FarklePad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          currentPoints={current[editing.id]?.points ?? null}
          currentFarkle={current[editing.id]?.farkle ?? false}
          onClose={() => setEditingId(null)}
          onSave={(points, farkle) => {
            onScore(editing.id, points, farkle)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function FarklePad({
  playerName,
  playerColor,
  currentPoints,
  currentFarkle,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  currentPoints: number | null
  currentFarkle: boolean
  onSave: (points: number, farkle: boolean) => void
  onClose: () => void
}) {
  const [digits, setDigits] = useState(currentPoints === null || currentFarkle ? '' : String(currentPoints))
  const [farkle, setFarkle] = useState(currentFarkle)
  const total = farkle ? 0 : digits === '' ? 0 : Number(digits)

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Banked this turn"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{scoreHint()}</p>
        <p className="pad-total" aria-live="polite">
          {farkle ? '0' : digits === '' ? '0' : digits}
          <span>{farkle ? 'farkle' : 'banked points'}</span>
        </p>
        <ul className="score-legend uno-pad-legend">
          {scoreLegend().map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.points}</strong>
            </li>
          ))}
        </ul>
        {farkle ? null : (
          <div className="keypad" aria-label="Score keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
              <Button
                key={key}
                variant="gray"
                size="large"
                className="keypad-digit"
                onClick={() => setDigits((current) => (current + key).replace(/^0+(?=\d)/, '').slice(0, 5))}
              >
                {key}
              </Button>
            ))}
            <span className="keypad-spacer" aria-hidden="true" />
            <Button
              variant="gray"
              size="large"
              className="keypad-digit"
              onClick={() => setDigits((current) => (current + '0').replace(/^0+(?=\d)/, '').slice(0, 5))}
            >
              0
            </Button>
            <Button
              variant="gray"
              size="large"
              className="keypad-action"
              aria-label="Delete last digit"
              onClick={() => setDigits((current) => current.slice(0, -1))}
            >
              ⌫
            </Button>
          </div>
        )}
        <div className="score-pad-toggle-row">
          <Toggle
            checked={farkle}
            onChange={(next) => {
              setFarkle(next)
              if (next) {
                setDigits('')
              }
            }}
            label="Farkle this turn"
          />
        </div>
      </div>
      <div className="sheet-actions">
        <TintedButton onClick={() => onSave(0, true)}>Farkle · 0</TintedButton>
        <PrimaryButton onClick={() => onSave(total, farkle)}>Lock in {total}</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function FarkleRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Farkle works',
      }}
    >
      <h2 className="scene-section-title">How Farkle works</h2>
      <article className="rule-card">
        <h2>Hot dice</h2>
        <FarkleMark />
        <p>Roll six dice. Set aside scoring dice and choose to bank or roll the rest. A roll with no score is a farkle.</p>
      </article>
      <article className="rule-card">
        <h2>Scoring a turn</h2>
        <ul className="score-legend">
          {scoreLegend().map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.points}</strong>
            </li>
          ))}
        </ul>
      </article>
      <article className="rule-card">
        <h2>Winning</h2>
        <p>{winConditionCopy()}</p>
      </article>
    </SceneShell>
  )
}

export function FarkleWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: FarkleGame
  onBack: () => void
  onHome: () => void
  onPlayAgain: (names: string[]) => void
  onRules: () => void
  onHistory: () => void
}) {
  const champs = winners(game)
  const rows = standings(game)
  const reached = rows.some((row) => row.total >= game.winThreshold)
  return (
    <SceneShell
      className="winner-screen"
      nav={{
        back: { label: 'Farkle', onClick: onBack },
        title: 'Match complete',
        subtitle: reached ? `First to ${game.winThreshold.toLocaleString()}` : 'Highest score called it',
        actions: [
          { label: 'Rules', onClick: onRules },
          { label: 'History', onClick: onHistory },
        ],
      }}
      flowLinks={[
        { label: 'Past games', onClick: onHistory },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <FarkleMark />
        <p className="eyebrow">{reached ? 'Hit 10,000' : 'Table called'}</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Hot dice'}</h1>
      </div>
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
            <span>{row.total.toLocaleString()}</span>
          </li>
        ))}
      </ol>
      <PrimaryButton onClick={() => onPlayAgain(game.players.map((player) => player.name))}>
        Same table, new pot
      </PrimaryButton>
      <GlassButton onClick={onHome}>Back home</GlassButton>
      <GlassButton onClick={onHistory}>Past games</GlassButton>
      <TextButton onClick={onRules}>Review the rules</TextButton>
    </SceneShell>
  )
}

export function FarkleHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: FarkleRecord) => void
}) {
  const [records, setRecords] = useState(() => listHistory())
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailTransition, setDetailTransition] = useState<'forward' | 'back' | 'none'>('none')
  const filtered = useMemo(() => searchHistory(records, query), [records, query])
  const selected = records.find((record) => record.id === selectedId) ?? null

  const closeDetail = () => {
    setDetailTransition('back')
    setSelectedId(null)
  }

  if (selected) {
    const champs = winners(selected)
    return (
      <SwipeBack onBack={closeDetail}>
        <SceneStage sceneKey={selected.id} transition={detailTransition}>
          <SceneShell
            className="history-screen"
            nav={{
              back: { label: 'Past games', onClick: closeDetail },
              title: 'Game detail',
              subtitle: formatWhen(selected.archivedAt),
            }}
          >
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
              <PrimaryButton onClick={() => onResume(selected)}>Resume this table</PrimaryButton>
            ) : null}
            <TextButton
              className="quiet"
              onClick={() => {
                deleteHistoryGame(selected.id)
                setRecords(listHistory())
                closeDetail()
              }}
            >
              Delete this game
            </TextButton>
          </SceneShell>
        </SceneStage>
      </SwipeBack>
    )
  }

  return (
    <SwipeBack onBack={onBack}>
      <SceneShell
        className="history-screen"
        nav={{
          back: { label: 'Farkle', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Hot dice', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Hot dice', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Farkle games yet.</p>
        ) : (
          <ListSection className="history-list">
            {filtered.map((record, index) => (
              <HistoryGameRow
                key={record.id}
                when={formatWhen(record.archivedAt)}
                headline={historyHeadline(record)}
                meta={record.status === 'finished' ? 'Completed' : `Stopped after turn ${handsRecorded(record)}`}
                onOpen={() => {
                  setDetailTransition('forward')
                  setSelectedId(record.id)
                }}
                separator={index < filtered.length - 1}
              />
            ))}
          </ListSection>
        )}
      </SceneShell>
    </SwipeBack>
  )
}

export function FarkleLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Farkle', onClick: onBack },
        title: 'Hot dice',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Farkle match and stats will show up here.</p>
      ) : (
        <>
          <article className="leaderboard-panel">
            <header>
              <h2>Most wins</h2>
            </header>
            <ListSection className="leaderboard-list">
              {crowns.map((entry, index) => (
                <ListRow
                  key={entry.name}
                  leading={<span className="place">{index + 1}</span>}
                  trailing={<span className="leaderboard-stat gold-stat">{entry.wins}</span>}
                  separator={index < crowns.length - 1}
                >
                  <div className="leaderboard-name">
                    <strong>{entry.name}</strong>
                    <small>{entry.gamesPlayed} games</small>
                  </div>
                </ListRow>
              ))}
            </ListSection>
          </article>
          <article className="leaderboard-panel">
            <header>
              <h2>Most last place</h2>
            </header>
            <ListSection className="leaderboard-list">
              {lanterns.map((entry, index) => (
                <ListRow
                  key={entry.name}
                  leading={<span className="place">{index + 1}</span>}
                  trailing={<span className="leaderboard-stat lantern-stat">{entry.lastPlace}</span>}
                  separator={index < lanterns.length - 1}
                >
                  <div className="leaderboard-name">
                    <strong>{entry.name}</strong>
                    <small>{entry.gamesPlayed} games</small>
                  </div>
                </ListRow>
              ))}
            </ListSection>
          </article>
        </>
      )}
    </SceneShell>
  )
}
