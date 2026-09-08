import { Button, ListRow, ListSection, SearchBar, Sheet } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SorryMark, SorryRace } from './Brand.tsx'
import {
  canCallGame,
  playerColor,
  playerPawns,
  standings,
  winners,
  wouldFinish,
} from './engine.ts'
import { scoreHint, scoreLegend, winConditionCopy } from './rules.ts'
import {
  canResume,
  deleteHistoryGame,
  formatWhen,
  historyHeadline,
  listHistory,
  searchHistory,
} from './persist.ts'
import { buildLeaderboard, sortByLastPlace, sortByWins } from './leaderboard.ts'
import { MAX_PLAYERS, MIN_PLAYERS, PAWNS_PER_PLAYER, PLAYER_COLORS, type SorryGame, type SorryRecord } from './types.ts'

export function SorryHome({
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
        title: 'Sorry!',
        subtitle: 'Race all 4 home',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Home stretch', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <SorryMark />
        <p className="eyebrow">Four pawns</p>
        <h2 className="hero-display">Sorry!</h2>
        <p className="tagline">Slide, bump, and send them back. First to get all four pawns Home wins.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Start a new board
        </PrimaryButton>
        <ActionList items={[...(resume ? [{ label: 'Resume the table', onClick: onResume }] : [])]} />
      </div>
    </SceneShell>
  )
}

export function SorrySetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Sorry!', onClick: onBack },
        title: 'New board',
        subtitle: 'Who’s racing?',
      }}
    >
      <p className="hint">Two to four players. Each races four pawns. First to get all four Home wins.</p>
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
        Start the race
      </PrimaryButton>
    </SceneShell>
  )
}

export function SorryPlay({
  game,
  onBack,
  onScore,
  onFinish,
  onRules,
  onQuit,
}: {
  game: SorryGame
  onBack: () => void
  onScore: (playerId: string, pawnsHome: number | null) => void
  onFinish: () => void
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
        back: { label: 'Sorry!', onClick: onBack },
        title: 'This race',
        subtitle: `First to ${game.winThreshold} Home`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Pawns Home</h1>
      <SorryRace
        threshold={game.winThreshold}
        scores={game.players.map((player) => ({
          id: player.id,
          total: playerPawns(game, player.id),
          color: playerColor(player).hex,
        }))}
      />
      {leader ? (
        <p className="hint center frost-tile">
          Closest to Home:{' '}
          <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.pawnsHome} / {PAWNS_PER_PLAYER}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const score = game.scores[player.id]
          const entered = typeof score?.pawnsHome === 'number'
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={entered ? `${score?.pawnsHome ?? 0} of ${PAWNS_PER_PLAYER} Home` : `Race ${PAWNS_PER_PLAYER} pawns Home`}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={entered ? score?.pawnsHome ?? 'Tap' : 'Tap'}
              entered={entered}
              separator={index < game.players.length - 1}
              onClick={() => setEditingId(player.id)}
            />
          )
        })}
      </ListSection>
      {finishReady ? (
        <PrimaryButton className="pulse" onClick={onFinish}>
          See the winner
        </PrimaryButton>
      ) : (
        <p className="hint center frost-tile">Tap a player to count how many pawns made it Home.</p>
      )}
      <TextButton className="quiet" onClick={onQuit}>
        Leave table
      </TextButton>
      {canCallGame(game) && !finishReady ? (
        <TextButton className="quiet" onClick={onFinish}>
          Call the game
        </TextButton>
      ) : null}
      {editing ? (
        <SorryPad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          currentPawns={game.scores[editing.id]?.pawnsHome ?? null}
          onClose={() => setEditingId(null)}
          onSave={(pawns) => {
            onScore(editing.id, pawns)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function SorryPad({
  playerName,
  playerColor,
  currentPawns,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  currentPawns: number | null
  onSave: (pawns: number) => void
  onClose: () => void
}) {
  const [pawns, setPawns] = useState(currentPawns ?? 0)

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Pawns Home"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{scoreHint()}</p>
        <p className="pad-total" aria-live="polite">
          {pawns}
          <span>pawns Home</span>
        </p>
        <div className="stepper-row" role="group" aria-label="Pawns Home">
          {[0, 1, 2, 3, 4].map((value) => (
            <Button
              key={value}
              variant={pawns === value ? 'filled' : 'gray'}
              size="large"
              className="keypad-digit"
              onClick={() => setPawns(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
      <div className="sheet-actions">
        <PrimaryButton onClick={() => onSave(pawns)}>Lock in {pawns} Home</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function SorryRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Sorry! works',
      }}
    >
      <h2 className="scene-section-title">How Sorry! works</h2>
      <article className="rule-card">
        <h2>The board</h2>
        <SorryMark />
        <p>Four colors, four pawns each. Draw cards to leave Start, slide, bump, and say Sorry! as you race Home.</p>
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

export function SorryWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: SorryGame
  onBack: () => void
  onHome: () => void
  onPlayAgain: (names: string[]) => void
  onRules: () => void
  onHistory: () => void
}) {
  const champs = winners(game)
  const rows = standings(game)
  const reached = rows.some((row) => row.pawnsHome >= game.winThreshold)
  return (
    <SceneShell
      className="winner-screen"
      nav={{
        back: { label: 'Sorry!', onClick: onBack },
        title: 'Match complete',
        subtitle: reached ? 'All four Home' : 'Most pawns Home',
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
        <SorryMark />
        <p className="eyebrow">{reached ? 'Safe at Home' : 'Table called'}</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Sorry, not sorry'}</h1>
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
            <span>{row.pawnsHome} Home</span>
          </li>
        ))}
      </ol>
      <PrimaryButton onClick={() => onPlayAgain(game.players.map((player) => player.name))}>
        Same table, new race
      </PrimaryButton>
      <GlassButton onClick={onHome}>Back home</GlassButton>
      <GlassButton onClick={onHistory}>Past games</GlassButton>
      <TextButton onClick={onRules}>Review the rules</TextButton>
    </SceneShell>
  )
}

export function SorryHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: SorryRecord) => void
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
          back: { label: 'Sorry!', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Home stretch', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Home stretch', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Sorry! games yet.</p>
        ) : (
          <ListSection className="history-list">
            {filtered.map((record, index) => (
              <HistoryGameRow
                key={record.id}
                when={formatWhen(record.archivedAt)}
                headline={historyHeadline(record)}
                meta={record.status === 'finished' ? 'Completed' : 'Stopped early'}
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

export function SorryLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Sorry!', onClick: onBack },
        title: 'Home stretch',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Sorry! match and stats will show up here.</p>
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
