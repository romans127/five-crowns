import { Button, ListRow, ListSection, SearchBar, Sheet, Toggle } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SequenceMark, SequenceRace } from './Brand.tsx'
import {
  canCallGame,
  playerColor,
  playerSequences,
  sequencesNeeded,
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
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type SequenceGame,
  type SequenceMode,
  type SequenceRecord,
} from './types.ts'

export function SequenceHome({
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
        title: 'Sequence',
        subtitle: 'Make your sequences',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Chip rack', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <SequenceMark />
        <p className="eyebrow">Cards and chips</p>
        <h2 className="hero-display">Sequence</h2>
        <p className="tagline">Play a card, place a chip, and build five in a row. Track sequences until someone hits the mark.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Set the table
        </PrimaryButton>
        <ActionList items={[...(resume ? [{ label: 'Resume the table', onClick: onResume }] : [])]} />
      </div>
    </SceneShell>
  )
}

export function SequenceSetup({
  onBack,
  onStart,
}: {
  onBack: () => void
  onStart: (names: string[], mode: SequenceMode) => void
}) {
  const [names, setNames] = useState(['', ''])
  const [teams, setTeams] = useState(false)
  const readyNames = names.map((name) => name.trim()).filter(Boolean)
  const mode: SequenceMode = teams ? 'teams' : 'open'
  const need = sequencesNeeded(Math.max(readyNames.length, MIN_PLAYERS), mode)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Sequence', onClick: onBack },
        title: 'New table',
        subtitle: teams ? 'Who’s on each team?' : 'Who’s playing?',
      }}
    >
      <p className="hint">
        {teams || readyNames.length === 2
          ? `Need ${need} sequence to win.`
          : `Need ${need} sequences to win for 3–6 players.`}
      </p>
      <ListSection className="player-fields">
        <ListRow
          trailing={
            <Toggle
              checked={teams}
              onChange={setTeams}
              label="Teams / 2-player"
            />
          }
          separator
        >
          <span className="player-meta">
            <strong>Teams or two players</strong>
            <small>Win with {teams ? 1 : sequencesNeeded(Math.max(readyNames.length, 3), 'open')} sequence{teams ? '' : 's'}</small>
          </span>
        </ListRow>
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
        <GlassButton onClick={() => setNames([...names, ''])}>{teams ? 'Add a team' : 'Add a player'}</GlassButton>
      ) : null}
      <PrimaryButton disabled={readyNames.length < MIN_PLAYERS} onClick={() => onStart(readyNames, mode)}>
        Deal the cards
      </PrimaryButton>
    </SceneShell>
  )
}

export function SequencePlay({
  game,
  onBack,
  onScore,
  onFinish,
  onRules,
  onQuit,
}: {
  game: SequenceGame
  onBack: () => void
  onScore: (playerId: string, sequences: number | null) => void
  onFinish: () => void
  onRules: () => void
  onQuit: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const leader = standings(game)[0]
  const editing = game.players.find((player) => player.id === editingId) ?? null
  const finishReady = wouldFinish(game)
  const seat = game.mode === 'teams' ? 'team' : 'player'

  return (
    <SceneShell
      className="play-screen"
      nav={{
        back: { label: 'Sequence', onClick: onBack },
        title: 'This table',
        subtitle: `${game.winThreshold} sequence${game.winThreshold === 1 ? '' : 's'} to win`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Count sequences</h1>
      <SequenceRace
        threshold={game.winThreshold}
        scores={game.players.map((player) => ({
          id: player.id,
          total: playerSequences(game, player.id),
          color: playerColor(player).hex,
        }))}
      />
      {leader ? (
        <p className="hint center frost-tile">
          Closest to {game.winThreshold}:{' '}
          <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.sequences}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const score = game.scores[player.id]
          const entered = typeof score?.sequences === 'number'
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={entered ? `${score?.sequences ?? 0} of ${game.winThreshold}` : `Need ${game.winThreshold} as a ${seat}`}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={entered ? score?.sequences ?? 'Tap' : 'Tap'}
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
        <p className="hint center frost-tile">Tap a {seat} to count completed sequences of five.</p>
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
        <SequencePad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          currentSequences={game.scores[editing.id]?.sequences ?? null}
          onClose={() => setEditingId(null)}
          onSave={(sequences) => {
            onScore(editing.id, sequences)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function SequencePad({
  playerName,
  playerColor,
  currentSequences,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  currentSequences: number | null
  onSave: (sequences: number) => void
  onClose: () => void
}) {
  const [sequences, setSequences] = useState(currentSequences ?? 0)

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Sequences"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{scoreHint()}</p>
        <p className="pad-total" aria-live="polite">
          {sequences}
          <span>sequences</span>
        </p>
        <div className="stepper-row" role="group" aria-label="Sequences completed">
          {[0, 1, 2, 3].map((value) => (
            <Button
              key={value}
              variant={sequences === value ? 'filled' : 'gray'}
              size="large"
              className="keypad-digit"
              onClick={() => setSequences(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
      <div className="sheet-actions">
        <PrimaryButton onClick={() => onSave(sequences)}>Lock in {sequences}</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function SequenceRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Sequence works',
      }}
    >
      <h2 className="scene-section-title">How Sequence works</h2>
      <article className="rule-card">
        <h2>The board</h2>
        <SequenceMark />
        <p>Play a card that matches a space, then cover it with a chip. Five in a row is a sequence. Jacks add or remove chips.</p>
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

export function SequenceWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: SequenceGame
  onBack: () => void
  onHome: () => void
  onPlayAgain: (names: string[]) => void
  onRules: () => void
  onHistory: () => void
}) {
  const champs = winners(game)
  const rows = standings(game)
  const reached = rows.some((row) => row.sequences >= game.winThreshold)
  return (
    <SceneShell
      className="winner-screen"
      nav={{
        back: { label: 'Sequence', onClick: onBack },
        title: 'Match complete',
        subtitle: reached ? `${game.winThreshold} sequence${game.winThreshold === 1 ? '' : 's'}` : 'Most sequences',
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
        <SequenceMark />
        <p className="eyebrow">{reached ? 'Row locked' : 'Table called'}</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Sequence complete'}</h1>
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
            <span>{row.sequences}</span>
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

export function SequenceHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: SequenceRecord) => void
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
          back: { label: 'Sequence', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Chip rack', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Chip rack', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Sequence games yet.</p>
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

export function SequenceLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Sequence', onClick: onBack },
        title: 'Chip rack',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Sequence match and stats will show up here.</p>
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
