import { Button, ListRow, ListSection, SearchBar, Sheet } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { CribbageMark, CribbageRace } from './Brand.tsx'
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
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type CribbageGame, type CribbageRecord } from './types.ts'

function DigitPad({
  digits,
  maxLength,
  onDigits,
}: {
  digits: string
  maxLength: number
  onDigits: (next: string) => void
}) {
  return (
    <div className="keypad" aria-label="Score keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
        <Button
          key={key}
          variant="gray"
          size="large"
          className="keypad-digit"
          onClick={() => onDigits((digits + key).replace(/^0+(?=\d)/, '').slice(0, maxLength))}
        >
          {key}
        </Button>
      ))}
      <span className="keypad-spacer" aria-hidden="true" />
      <Button
        variant="gray"
        size="large"
        className="keypad-digit"
        onClick={() => onDigits((digits + '0').replace(/^0+(?=\d)/, '').slice(0, maxLength))}
      >
        0
      </Button>
      <Button
        variant="gray"
        size="large"
        className="keypad-action"
        aria-label="Delete last digit"
        onClick={() => onDigits(digits.slice(0, -1))}
      >
        ⌫
      </Button>
    </div>
  )
}

export function CribbageHome({
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
        title: 'Cribbage',
        subtitle: 'Race to 121',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Peg board', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <CribbageMark />
        <p className="eyebrow">Peg the board</p>
        <h2 className="hero-display">Cribbage</h2>
        <p className="tagline">Play the cards at the table. The app pegs each hand on the race to 121.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Deal a new game
        </PrimaryButton>
        <ActionList items={[...(resume ? [{ label: 'Resume the table', onClick: onResume }] : [])]} />
      </div>
    </SceneShell>
  )
}

export function CribbageSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Cribbage', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s pegging?',
      }}
    >
      <p className="hint">Two to six players. First to 121 — pegging, crib, and the show as one total per hand.</p>
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
        Cut for the deal
      </PrimaryButton>
    </SceneShell>
  )
}

export function CribbagePlay({
  game,
  onBack,
  onScore,
  onNextRound,
  onCallGame,
  onRules,
  onQuit,
}: {
  game: CribbageGame
  onBack: () => void
  onScore: (playerId: string, points: number | null) => void
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
        back: { label: 'Cribbage', onClick: onBack },
        title: `Hand ${game.currentRound + 1}`,
        subtitle: `Race to ${game.winThreshold}`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Peg this hand</h1>
      <CribbageRace
        threshold={game.winThreshold}
        scores={game.players.map((player) => ({
          id: player.id,
          total: playerTotal(game, player.id),
          color: playerColor(player).hex,
        }))}
      />
      {leader ? (
        <p className="hint center frost-tile">
          Closest to {game.winThreshold}:{' '}
          <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
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
                  ? `Total ${playerTotal(game, player.id)} · +${awarded} this hand`
                  : `Total ${playerTotal(game, player.id)} · race to ${game.winThreshold}`
              }
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={entered ? score?.points ?? 'Tap' : 'Tap'}
              entered={entered}
              separator={index < game.players.length - 1}
              onClick={() => setEditingId(player.id)}
            />
          )
        })}
      </ListSection>
      {ready ? (
        <PrimaryButton className="pulse" onClick={onNextRound}>
          {finishReady ? 'See the winner' : 'Next hand'}
        </PrimaryButton>
      ) : (
        <p className="hint center frost-tile">Tap a player to peg pegging, crib, and the show as one total.</p>
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
        <CribbagePad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          currentPoints={current[editing.id]?.points ?? null}
          onClose={() => setEditingId(null)}
          onSave={(points) => {
            onScore(editing.id, points)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function CribbagePad({
  playerName,
  playerColor,
  currentPoints,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  currentPoints: number | null
  onSave: (points: number) => void
  onClose: () => void
}) {
  const [digits, setDigits] = useState(currentPoints === null ? '' : String(currentPoints))
  const total = digits === '' ? 0 : Number(digits)

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Points this hand"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{scoreHint()}</p>
        <p className="pad-total" aria-live="polite">
          {digits === '' ? '0' : digits}
          <span>pegged points</span>
        </p>
        <ul className="score-legend uno-pad-legend">
          {scoreLegend().map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.points}</strong>
            </li>
          ))}
        </ul>
        <DigitPad digits={digits} maxLength={3} onDigits={setDigits} />
      </div>
      <div className="sheet-actions">
        <PrimaryButton onClick={() => onSave(total)}>Lock in {total}</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function CribbageRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How cribbage works',
      }}
    >
      <h2 className="scene-section-title">How cribbage works</h2>
      <article className="rule-card">
        <h2>The board</h2>
        <CribbageMark />
        <p>Two tracks of holes. Peg forward for every point you score in the play, the crib, and the show.</p>
      </article>
      <article className="rule-card">
        <h2>Scoring a hand</h2>
        <ul className="score-legend">
          {scoreLegend().map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.points}</strong>
            </li>
          ))}
        </ul>
        <p>Enter one total per player each hand — combine pegging, the hand, and the crib if they owned it.</p>
      </article>
      <article className="rule-card">
        <h2>Winning</h2>
        <p>{winConditionCopy()}</p>
      </article>
    </SceneShell>
  )
}

export function CribbageWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: CribbageGame
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
        back: { label: 'Cribbage', onClick: onBack },
        title: 'Match complete',
        subtitle: reached ? `First to ${game.winThreshold}` : 'Highest score called it',
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
        <CribbageMark />
        <p className="eyebrow">{reached ? 'Hit 121' : 'Table called'}</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Skunked the board'}</h1>
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
            <span>{row.total}</span>
          </li>
        ))}
      </ol>
      <PrimaryButton onClick={() => onPlayAgain(game.players.map((player) => player.name))}>
        Same table, new deal
      </PrimaryButton>
      <GlassButton onClick={onHome}>Back home</GlassButton>
      <GlassButton onClick={onHistory}>Past games</GlassButton>
      <TextButton onClick={onRules}>Review the rules</TextButton>
    </SceneShell>
  )
}

export function CribbageHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: CribbageRecord) => void
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
          back: { label: 'Cribbage', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Peg board', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Peg board', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved cribbage games yet.</p>
        ) : (
          <ListSection className="history-list">
            {filtered.map((record, index) => (
              <HistoryGameRow
                key={record.id}
                when={formatWhen(record.archivedAt)}
                headline={historyHeadline(record)}
                meta={record.status === 'finished' ? 'Completed' : `Stopped after hand ${handsRecorded(record)}`}
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

export function CribbageLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Cribbage', onClick: onBack },
        title: 'Peg board',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a cribbage match and stats will show up here.</p>
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
