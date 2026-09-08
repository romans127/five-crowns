import { Button, ListRow, ListSection, SearchBar, Sheet, Toggle } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton, TintedButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { PhaseCardColors, PhaseLadder, PhaseMark } from './Brand.tsx'
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
  const flowLinks = [
    {
      label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games',
      onClick: onHistory,
    },
    { label: 'Phase board', onClick: onLeaderboard },
    { label: 'Rules', onClick: onRules },
  ]

  return (
    <SceneShell
      className="home-screen"
      nav={{
        back: { label: 'All games', onClick: onLeaveGames },
        title: 'Phase 10',
        subtitle: 'Phase by phase',
      }}
      flowLinks={flowLinks}
    >
      <div className="hero-block">
        <PhaseCardColors size="lg" />
        <PhaseMark />
        <PhaseLadder />
        <p className="eyebrow">Phase by phase</p>
        <h2 className="hero-display">Phase 10</h2>
        <p className="tagline">Complete every phase. Leftovers still count against you.</p>
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

export function Phase10Setup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Phase 10', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s playing?',
      }}
    >
      <p className="hint">Two to eight players. First to finish Phase 10 with the lowest leftover total wins.</p>
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
              canRemove={false}
              onChange={(value) => {
                const next = [...names]
                next[index] = value
                setNames(next)
              }}
              onRemove={() => undefined}
            />
          )
        })}
      </ListSection>
      {names.length < MAX_PLAYERS ? (
        <GlassButton onClick={() => setNames([...names, ''])}>Add a player</GlassButton>
      ) : null}
      <PrimaryButton disabled={readyNames.length < MIN_PLAYERS} onClick={() => onStart(readyNames)}>
        Shuffle up and deal
      </PrimaryButton>
    </SceneShell>
  )
}

export function Phase10Play({
  game,
  onBack,
  onScore,
  onNextRound,
  onRules,
  onQuit,
}: {
  game: Phase10Game
  onBack: () => void
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
    <SceneShell
      className="play-screen"
      nav={{
        back: { label: 'Phase 10', onClick: onBack },
        title: `Hand ${game.currentRound + 1}`,
        subtitle: '10 cards · Make your phase',
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Make your phase</h1>
      <PhaseCardColors size="sm" />
      {leader ? (
        <p className="hint center frost-tile">
          Lowest so far: <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const score = current[player.id]
          const entered = typeof score?.leftover === 'number'
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={`${phaseLabel(player.phase)} · Total ${playerTotal(game, player.id)}`}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={entered ? score?.leftover ?? 'Tap' : 'Tap'}
              entered={entered}
              separator={index < game.players.length - 1}
              onClick={() => setEditingId(player.id)}
            />
          )
        })}
      </ListSection>
      {ready ? (
        <PrimaryButton className="pulse" onClick={onNextRound}>
          Next hand
        </PrimaryButton>
      ) : (
        <p className="hint center frost-tile">Tap a player for leftovers and whether they completed this phase.</p>
      )}
      <TextButton className="quiet" onClick={onQuit}>
        Leave table
      </TextButton>
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
    </SceneShell>
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
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => { if (!next) onClose() }}
      detent="large"
      title="Leftovers this hand"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">
          {phaseLabelText} · {leftoverHint()}
        </p>
        <p className="pad-total" aria-live="polite">
          {digits === '' ? '0' : digits}
          <span>leftover points</span>
        </p>
        <div className="keypad" aria-label="Score keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <Button
              key={key}
              variant="gray"
              size="large"
              className="keypad-digit"
              onClick={() => setDigits((current) => (current + key).replace(/^0+(?=\d)/, '').slice(0, 3))}
            >
              {key}
            </Button>
          ))}
          <span className="keypad-spacer" aria-hidden="true" />
          <Button
            variant="gray"
            size="large"
            className="keypad-digit"
            onClick={() => setDigits((current) => (current + '0').replace(/^0+(?=\d)/, '').slice(0, 3))}
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
        <div className="score-pad-toggle-row">
          <Toggle checked={completed} onChange={setCompleted} label="Completed this phase" />
        </div>
      </div>
      <div className="sheet-actions">
        <TintedButton onClick={() => onSave(0, completed)}>Hit out · 0</TintedButton>
        <PrimaryButton onClick={() => onSave(total, completed)}>Lock in {total}</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function Phase10Rules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Phase 10 works',
      }}
    >
      <h2 className="scene-section-title">Phase 10 phases</h2>
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
    </SceneShell>
  )
}

export function Phase10Winner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: Phase10Game
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
        back: { label: 'Phase 10', onClick: onBack },
        title: 'Match complete',
        subtitle: 'Phase 10 finished',
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
        <PhaseCardColors size="md" />
        <PhaseMark />
        <p className="eyebrow">Phase 10 complete</p>
        <h1>{champs.length > 1 ? 'Shared finish!' : 'Phase master'}</h1>
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
  const [detailTransition, setDetailTransition] = useState<'forward' | 'back' | 'none'>('none')
  const filtered = useMemo(() => searchHistory(records, query), [records, query])
  const selected = records.find((record) => record.id === selectedId) ?? null

  const openDetail = (id: string) => {
    setDetailTransition('forward')
    setSelectedId(id)
  }

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
          back: { label: 'Phase 10', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Phase board', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Phase board', onClick: onLeaderboard }]}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search players…"
          aria-label="Search past games"
        />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Phase 10 games yet.</p>
        ) : (
          <ListSection className="history-list">
            {filtered.map((record, index) => (
              <HistoryGameRow
                key={record.id}
                when={formatWhen(record.archivedAt)}
                headline={historyHeadline(record)}
                meta={record.status === 'finished' ? 'Completed' : `Stopped after hand ${handsRecorded(record)}`}
                onOpen={() => openDetail(record.id)}
                separator={index < filtered.length - 1}
              />
            ))}
          </ListSection>
        )}
      </SceneShell>
    </SwipeBack>
  )
}

export function Phase10Leaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Phase 10', onClick: onBack },
        title: 'Phase board',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Phase 10 match and stats will show up here.</p>
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
