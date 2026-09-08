import { Button, ListRow, ListSection, SearchBar, Sheet, Toggle } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton, TintedButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { UnoCardColors, UnoMark, UnoRace } from './Brand.tsx'
import {
  canCallGame,
  playerColor,
  playerTotal,
  roundComplete,
  roundPoints,
  standings,
  wentOutPlayer,
  winners,
  wouldFinish,
} from './engine.ts'
import { HOUSE_SPECIAL_POINTS, leftoverHint, leftoverLegend, winConditionCopy } from './rules.ts'
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
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type UnoGame, type UnoRecord } from './types.ts'

export function UnoHome({
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
    { label: 'UNO board', onClick: onLeaderboard },
    { label: 'Rules', onClick: onRules },
  ]

  return (
    <SceneShell
      className="home-screen"
      nav={{
        back: { label: 'All games', onClick: onLeaveGames },
        title: 'UNO',
        subtitle: 'First to 500',
      }}
      flowLinks={flowLinks}
    >
      <div className="hero-block">
        <UnoCardColors size="lg" />
        <UnoMark />
        <p className="eyebrow">Yell it loud</p>
        <h2 className="hero-display">UNO</h2>
        <p className="tagline">Play the cards at the table. The app keeps leftover points and the race to 500.</p>
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

export function UnoSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'UNO', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s playing?',
      }}
    >
      <p className="hint">Two to ten players. First to 500 leftover points from opponents’ hands wins.</p>
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

export function UnoPlay({
  game,
  onBack,
  onScore,
  onNextRound,
  onCallGame,
  onRules,
  onQuit,
}: {
  game: UnoGame
  onBack: () => void
  onScore: (playerId: string, leftover: number | null, wentOut: boolean) => void
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
  const outPlayer = wentOutPlayer(game)
  const finishReady = wouldFinish(game)

  return (
    <SceneShell
      className="play-screen"
      nav={{
        back: { label: 'UNO', onClick: onBack },
        title: `Hand ${game.currentRound + 1}`,
        subtitle: `7 cards · First to ${game.winThreshold}`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Yell UNO</h1>
      <UnoCardColors size="sm" />
      <UnoRace
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
          const entered = typeof score?.leftover === 'number'
          const awarded = ready ? roundPoints(game, game.currentRound, player.id) : null
          const detail = awarded
            ? `Total ${playerTotal(game, player.id)} · +${awarded} this hand`
            : `Total ${playerTotal(game, player.id)} · race to ${game.winThreshold}`
          return (
            <PlayerScoreRow
              key={player.id}
              name={player.name}
              detail={detail}
              suit={
                <span className="seat-suit" style={{ color: color.hex }}>
                  {color.suit}
                </span>
              }
              scoreLabel={score?.wentOut ? 'Out' : entered ? score?.leftover ?? 'Tap' : 'Tap'}
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
        <p className="hint center frost-tile">
          {outPlayer
            ? `${outPlayer.name} went out. Enter leftover points for everyone else.`
            : 'Tap a player to mark who went out, then enter leftover points.'}
        </p>
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
        <UnoPad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          currentLeftover={current[editing.id]?.leftover ?? null}
          currentWentOut={current[editing.id]?.wentOut ?? false}
          onClose={() => setEditingId(null)}
          onSave={(leftover, wentOut) => {
            onScore(editing.id, leftover, wentOut)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function UnoPad({
  playerName,
  playerColor,
  currentLeftover,
  currentWentOut,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  currentLeftover: number | null
  currentWentOut: boolean
  onSave: (leftover: number, wentOut: boolean) => void
  onClose: () => void
}) {
  const [digits, setDigits] = useState(currentLeftover === null || currentWentOut ? '' : String(currentLeftover))
  const [wentOut, setWentOut] = useState(currentWentOut)
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
        <p className="pad-limit">{leftoverHint()}</p>
        <p className="pad-total" aria-live="polite">
          {wentOut ? '0' : digits === '' ? '0' : digits}
          <span>{wentOut ? 'went out' : 'leftover points'}</span>
        </p>
        <ul className="score-legend uno-pad-legend">
          {leftoverLegend().map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.points}</strong>
            </li>
          ))}
        </ul>
        {wentOut ? null : (
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
        )}
        <div className="score-pad-toggle-row">
          <Toggle
            checked={wentOut}
            onChange={(next) => {
              setWentOut(next)
              if (next) {
                setDigits('')
              }
            }}
            label="Went out this hand"
          />
        </div>
      </div>
      <div className="sheet-actions">
        <TintedButton onClick={() => onSave(0, true)}>Went out · 0</TintedButton>
        <PrimaryButton onClick={() => onSave(wentOut ? 0 : total, wentOut)}>
          Lock in {wentOut ? 0 : total}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}

export function UnoRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How UNO works',
      }}
    >
      <h2 className="scene-section-title">How UNO works</h2>
      <article className="rule-card">
        <h2>Colors</h2>
        <UnoCardColors size="md" />
        <p>Red, yellow, blue, and green. Match color or number. Wilds change the color for everyone.</p>
      </article>
      <article className="rule-card">
        <h2>Going out</h2>
        <p>
          Deal 7 cards. Draw and play until one player empties their hand. Yell “UNO” on your next-to-last card. If
          you forget and someone catches you before the next turn starts, draw two. The player who goes out scores
          leftover cards in everyone else’s hand.
        </p>
      </article>
      <article className="rule-card">
        <h2>Leftover scoring</h2>
        <ul className="score-legend">
          {leftoverLegend().map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.points}</strong>
            </li>
          ))}
        </ul>
        <p>
          If the last card is Draw Two or Wild Draw Four, that next player still draws, and those cards count in the
          leftover total. Some newer decks also score Wild Shuffle Hands and customizable cards at {HOUSE_SPECIAL_POINTS}.
        </p>
      </article>
      <article className="rule-card">
        <h2>Winning</h2>
        <p>{winConditionCopy()}</p>
      </article>
    </SceneShell>
  )
}

export function UnoWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: UnoGame
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
        back: { label: 'UNO', onClick: onBack },
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
        <UnoCardColors size="md" />
        <UnoMark />
        <p className="eyebrow">{reached ? 'Hit 500' : 'Table called'}</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'UNO!'}</h1>
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

export function UnoHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: UnoRecord) => void
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
          back: { label: 'UNO', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'UNO board', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'UNO board', onClick: onLeaderboard }]}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search players…"
          aria-label="Search past games"
        />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved UNO games yet.</p>
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

export function UnoLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'UNO', onClick: onBack },
        title: 'UNO board',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish an UNO match and stats will show up here.</p>
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
