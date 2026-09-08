import { Button, ListRow, ListSection, SearchBar, Sheet } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { QwixxMark, QwixxRows } from './Brand.tsx'
import {
  canCallGame,
  lockedRows,
  playerColor,
  playerTotal,
  standings,
  winners,
  wouldFinish,
} from './engine.ts'
import { scoreLegend, triangleScore, winConditionCopy } from './rules.ts'
import {
  canResume,
  deleteHistoryGame,
  formatWhen,
  historyHeadline,
  historyMeta,
  listHistory,
  searchHistory,
} from './persist.ts'
import { buildLeaderboard, sortByLastPlace, sortByWins } from './leaderboard.ts'
import {
  MAX_CROSSES,
  MAX_PENALTIES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  ROW_IDS,
  type QwixxGame,
  type QwixxRecord,
  type QwixxRowId,
} from './types.ts'

const ROW_META: Record<QwixxRowId, { label: string; fill: string }> = {
  red: { label: 'Red', fill: 'var(--qx-red, #e31c23)' },
  yellow: { label: 'Yellow', fill: 'var(--qx-yellow, #f5c400)' },
  green: { label: 'Green', fill: 'var(--qx-green, #1f9d55)' },
  blue: { label: 'Blue', fill: 'var(--qx-blue, #2b6cff)' },
}

export function QwixxHome({
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
        title: 'Qwixx',
        subtitle: 'Cross the rows',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Color board', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <QwixxMark />
        <p className="eyebrow">X the colors</p>
        <h2 className="hero-display">Qwixx</h2>
        <p className="tagline">Four colored rows, triangular scores, and −5 penalties. Highest pad wins.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Start a new pad
        </PrimaryButton>
        <ActionList items={[...(resume ? [{ label: 'Resume the table', onClick: onResume }] : [])]} />
      </div>
    </SceneShell>
  )
}

export function QwixxSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Qwixx', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s crossing?',
      }}
    >
      <p className="hint">Two to five players. Mark Xs on the real pad — this app totals the colored rows.</p>
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
        Open the pad
      </PrimaryButton>
    </SceneShell>
  )
}

export function QwixxPlay({
  game,
  onBack,
  onRow,
  onPenalties,
  onCallGame,
  onRules,
  onQuit,
}: {
  game: QwixxGame
  onBack: () => void
  onRow: (playerId: string, row: QwixxRowId, count: number) => void
  onPenalties: (playerId: string, count: number) => void
  onCallGame: () => void
  onRules: () => void
  onQuit: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const leader = standings(game)[0]
  const editing = game.players.find((player) => player.id === editingId) ?? null
  const finishReady = wouldFinish(game)

  return (
    <SceneShell
      className="play-screen"
      nav={{
        back: { label: 'Qwixx', onClick: onBack },
        title: 'Score pad',
        subtitle: 'Highest total wins',
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Cross the rows</h1>
      {leader ? (
        <p className="hint center frost-tile">
          Leading: <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const total = playerTotal(player)
          const locks = lockedRows(player.pad)
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={`${locks} lockout${locks === 1 ? '' : 's'} · ${player.pad.penalties} penalty`}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={total}
              entered={total !== 0 || player.pad.penalties > 0}
              separator={index < game.players.length - 1}
              onClick={() => setEditingId(player.id)}
            />
          )
        })}
      </ListSection>
      {canCallGame(game) ? (
        <PrimaryButton className={finishReady ? 'pulse' : undefined} onClick={onCallGame}>
          {finishReady ? 'See the winner' : 'End the pad'}
        </PrimaryButton>
      ) : (
        <p className="hint center frost-tile">Tap a player to mark Xs on each color and any penalty boxes.</p>
      )}
      <TextButton className="quiet" onClick={onQuit}>
        Leave table
      </TextButton>
      {editing ? (
        <QwixxPad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          pad={editing.pad}
          onClose={() => setEditingId(null)}
          onRow={(row, count) => onRow(editing.id, row, count)}
          onPenalties={(count) => onPenalties(editing.id, count)}
        />
      ) : null}
    </SceneShell>
  )
}

function Stepper({
  label,
  value,
  min,
  max,
  accent,
  detail,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  accent?: string
  detail: string
  onChange: (next: number) => void
}) {
  return (
    <div className="qx-stepper">
      <div className="qx-stepper__copy">
        <strong style={accent ? { color: accent } : undefined}>{label}</strong>
        <small>{detail}</small>
      </div>
      <div className="qx-stepper__controls">
        <Button variant="gray" size="small" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </Button>
        <span className="qx-stepper__value">{value}</span>
        <Button variant="gray" size="small" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </Button>
      </div>
    </div>
  )
}

function QwixxPad({
  playerName,
  playerColor,
  pad,
  onRow,
  onPenalties,
  onClose,
}: {
  playerName: string
  playerColor: string
  pad: QwixxGame['players'][number]['pad']
  onRow: (row: QwixxRowId, count: number) => void
  onPenalties: (count: number) => void
  onClose: () => void
}) {
  const total =
    ROW_IDS.reduce((sum, row) => sum + triangleScore(pad[row]), 0) - pad.penalties * 5

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Qwixx pad"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-total" aria-live="polite">
          {total}
          <span>pad total</span>
        </p>
        <QwixxRows red={pad.red} yellow={pad.yellow} green={pad.green} blue={pad.blue} />
        {ROW_IDS.map((row) => (
          <Stepper
            key={row}
            label={ROW_META[row].label}
            value={pad[row]}
            min={0}
            max={MAX_CROSSES}
            accent={ROW_META[row].fill}
            detail={`${triangleScore(pad[row])} points`}
            onChange={(next) => onRow(row, next)}
          />
        ))}
        <Stepper
          label="Penalties"
          value={pad.penalties}
          min={0}
          max={MAX_PENALTIES}
          detail={`−${pad.penalties * 5}`}
          onChange={onPenalties}
        />
      </div>
      <div className="sheet-actions">
        <PrimaryButton onClick={onClose}>Done</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function QwixxRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Qwixx works',
      }}
    >
      <h2 className="scene-section-title">How Qwixx works</h2>
      <article className="rule-card">
        <h2>Four colored rows</h2>
        <QwixxMark />
        <p>Red and yellow climb 2–12. Green and blue descend 12–2. Crosses must move in that direction.</p>
      </article>
      <article className="rule-card">
        <h2>Scoring</h2>
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

export function QwixxWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: QwixxGame
  onBack: () => void
  onHome: () => void
  onPlayAgain: (names: string[]) => void
  onRules: () => void
  onHistory: () => void
}) {
  const champs = winners(game)
  const rows = standings(game)
  return (
    <SceneShell
      className="winner-screen"
      nav={{
        back: { label: 'Qwixx', onClick: onBack },
        title: 'Match complete',
        subtitle: 'Highest pad',
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
        <QwixxMark />
        <p className="eyebrow">Lockouts in</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Top pad'}</h1>
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
        Same table, new pad
      </PrimaryButton>
      <GlassButton onClick={onHome}>Back home</GlassButton>
      <GlassButton onClick={onHistory}>Past games</GlassButton>
      <TextButton onClick={onRules}>Review the rules</TextButton>
    </SceneShell>
  )
}

export function QwixxHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: QwixxRecord) => void
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
          back: { label: 'Qwixx', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Color board', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Color board', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Qwixx games yet.</p>
        ) : (
          <ListSection className="history-list">
            {filtered.map((record, index) => (
              <HistoryGameRow
                key={record.id}
                when={formatWhen(record.archivedAt)}
                headline={historyHeadline(record)}
                meta={historyMeta(record)}
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

export function QwixxLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Qwixx', onClick: onBack },
        title: 'Color board',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Qwixx match and stats will show up here.</p>
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
