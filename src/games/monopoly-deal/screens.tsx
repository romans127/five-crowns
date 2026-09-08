import { Button, ListRow, ListSection, SearchBar, Sheet } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { DealMark, DealRace } from './Brand.tsx'
import {
  canCallGame,
  playerColor,
  playerPoints,
  playerSets,
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
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type DealGame, type DealRecord } from './types.ts'

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

export function DealHome({
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
        title: 'Monopoly Deal',
        subtitle: 'First to 3 sets',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Bank ledger', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <DealMark />
        <p className="eyebrow">Property sets</p>
        <h2 className="hero-display">Monopoly Deal</h2>
        <p className="tagline">Play the cards at the table. Track complete sets — first to three takes the deal.</p>
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

export function DealSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Monopoly Deal', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s dealing?',
      }}
    >
      <p className="hint">Two to five players. First to three complete property sets wins. Optional cash is only a tie-break.</p>
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
        Deal the cards
      </PrimaryButton>
    </SceneShell>
  )
}

export function DealPlay({
  game,
  onBack,
  onScore,
  onFinish,
  onRules,
  onQuit,
}: {
  game: DealGame
  onBack: () => void
  onScore: (playerId: string, sets: number | null, points: number | null) => void
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
        back: { label: 'Monopoly Deal', onClick: onBack },
        title: 'This deal',
        subtitle: `First to ${game.winThreshold} sets`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Count the sets</h1>
      <DealRace
        threshold={game.winThreshold}
        scores={game.players.map((player) => ({
          id: player.id,
          total: playerSets(game, player.id),
          color: playerColor(player).hex,
        }))}
      />
      {leader ? (
        <p className="hint center frost-tile">
          Closest to {game.winThreshold} sets:{' '}
          <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.sets}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const score = game.scores[player.id]
          const entered = typeof score?.sets === 'number'
          const points = playerPoints(game, player.id)
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={entered ? `${score?.sets ?? 0} sets${points > 0 ? ` · ${points} cash` : ''}` : `Race to ${game.winThreshold} sets`}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={entered ? score?.sets ?? 'Tap' : 'Tap'}
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
        <p className="hint center frost-tile">Tap a player to enter complete property sets and optional cash.</p>
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
        <DealPad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          currentSets={game.scores[editing.id]?.sets ?? null}
          currentPoints={game.scores[editing.id]?.points ?? null}
          onClose={() => setEditingId(null)}
          onSave={(sets, points) => {
            onScore(editing.id, sets, points)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function DealPad({
  playerName,
  playerColor,
  currentSets,
  currentPoints,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  currentSets: number | null
  currentPoints: number | null
  onSave: (sets: number, points: number) => void
  onClose: () => void
}) {
  const [sets, setSets] = useState(currentSets ?? 0)
  const [digits, setDigits] = useState(currentPoints === null ? '' : String(currentPoints))
  const points = digits === '' ? 0 : Number(digits)

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Sets this deal"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{scoreHint()}</p>
        <p className="pad-total" aria-live="polite">
          {sets}
          <span>complete sets</span>
        </p>
        <div className="stepper-row" role="group" aria-label="Complete sets">
          {[0, 1, 2, 3].map((value) => (
            <Button
              key={value}
              variant={sets === value ? 'filled' : 'gray'}
              size="large"
              className="keypad-digit"
              aria-label={`${value} ${value === 1 ? 'set' : 'sets'}`}
              onClick={() => setSets(value)}
            >
              {value}
            </Button>
          ))}
        </div>
        <p className="pad-limit">Optional cash / property points</p>
        <DigitPad digits={digits} maxLength={3} onDigits={setDigits} />
      </div>
      <div className="sheet-actions">
        <PrimaryButton onClick={() => onSave(sets, points)}>Lock in {sets} sets</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function DealRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Monopoly Deal works',
      }}
    >
      <h2 className="scene-section-title">How Monopoly Deal works</h2>
      <article className="rule-card">
        <h2>The deal</h2>
        <DealMark />
        <p>This is the card game, not the classic Monopoly board. Charge rent, steal sets, and bank money — then count complete property sets.</p>
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

export function DealWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: DealGame
  onBack: () => void
  onHome: () => void
  onPlayAgain: (names: string[]) => void
  onRules: () => void
  onHistory: () => void
}) {
  const champs = winners(game)
  const rows = standings(game)
  const reached = rows.some((row) => row.sets >= game.winThreshold)
  return (
    <SceneShell
      className="winner-screen"
      nav={{
        back: { label: 'Monopoly Deal', onClick: onBack },
        title: 'Match complete',
        subtitle: reached ? `First to ${game.winThreshold} sets` : 'Most sets called it',
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
        <DealMark />
        <p className="eyebrow">{reached ? 'Three sets' : 'Table called'}</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Bank closed'}</h1>
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
            <span>
              {row.sets} sets{row.points > 0 ? ` · ${row.points}` : ''}
            </span>
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

export function DealHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: DealRecord) => void
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
          back: { label: 'Monopoly Deal', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Bank ledger', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Bank ledger', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Monopoly Deal games yet.</p>
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

export function DealLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Monopoly Deal', onClick: onBack },
        title: 'Bank ledger',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Monopoly Deal and stats will show up here.</p>
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
