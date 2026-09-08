import { Button, ListRow, ListSection, SearchBar, Sheet } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PlayerScoreRow, PrimaryButton, TextButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { TtrMark, TtrRace } from './Brand.tsx'
import {
  canCallGame,
  playerColor,
  playerTotal,
  scoreComplete,
  standings,
  winners,
  wouldFinish,
} from './engine.ts'
import { LONGEST_ROUTE_BONUS, scoreHint, scoreLegend, winConditionCopy } from './rules.ts'
import {
  canResume,
  deleteHistoryGame,
  formatWhen,
  historyHeadline,
  listHistory,
  searchHistory,
} from './persist.ts'
import { buildLeaderboard, sortByLastPlace, sortByWins } from './leaderboard.ts'
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type TtrGame, type TtrRecord } from './types.ts'

type PadField = 'routes' | 'tickets' | 'longest'

function DigitPad({
  digits,
  maxLength,
  allowMinus,
  onDigits,
}: {
  digits: string
  maxLength: number
  allowMinus?: boolean
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
          onClick={() => {
            const negative = digits.startsWith('-')
            const body = digits.replace('-', '')
            const nextBody = (body + key).replace(/^0+(?=\d)/, '').slice(0, maxLength)
            onDigits(negative ? `-${nextBody}` : nextBody)
          }}
        >
          {key}
        </Button>
      ))}
      {allowMinus ? (
        <Button
          variant="gray"
          size="large"
          className="keypad-action"
          aria-label="Toggle minus"
          onClick={() => {
            if (digits.startsWith('-')) {
              onDigits(digits.slice(1))
              return
            }
            onDigits(digits === '' ? '-' : `-${digits}`)
          }}
        >
          ±
        </Button>
      ) : (
        <span className="keypad-spacer" aria-hidden="true" />
      )}
      <Button
        variant="gray"
        size="large"
        className="keypad-digit"
        onClick={() => {
          const negative = digits.startsWith('-')
          const body = digits.replace('-', '')
          const nextBody = (body + '0').replace(/^0+(?=\d)/, '').slice(0, maxLength)
          onDigits(negative && nextBody !== '0' ? `-${nextBody}` : nextBody)
        }}
      >
        0
      </Button>
      <Button
        variant="gray"
        size="large"
        className="keypad-action"
        aria-label="Delete last digit"
        onClick={() => {
          if (digits === '-') {
            onDigits('')
            return
          }
          onDigits(digits.slice(0, -1))
        }}
      >
        ⌫
      </Button>
    </div>
  )
}

export function TtrHome({
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
        title: 'Ticket to Ride',
        subtitle: 'Claim the rails',
      }}
      flowLinks={[
        { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
        { label: 'Station board', onClick: onLeaderboard },
        { label: 'Rules', onClick: onRules },
      ]}
    >
      <div className="hero-block">
        <TtrMark />
        <p className="eyebrow">Map and tickets</p>
        <h2 className="hero-display">Ticket to Ride</h2>
        <p className="tagline">Claim routes, cash tickets, and take the longest-route bonus. Highest total wins.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Open the map
        </PrimaryButton>
        <ActionList items={[...(resume ? [{ label: 'Resume the table', onClick: onResume }] : [])]} />
      </div>
    </SceneShell>
  )
}

export function TtrSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Ticket to Ride', onClick: onBack },
        title: 'New map',
        subtitle: 'Who’s riding?',
      }}
    >
      <p className="hint">Two to five players. Enter route points, net tickets, and the longest-route bonus at the end.</p>
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
        Deal the tickets
      </PrimaryButton>
    </SceneShell>
  )
}

export function TtrPlay({
  game,
  onBack,
  onScore,
  onFinish,
  onRules,
  onQuit,
}: {
  game: TtrGame
  onBack: () => void
  onScore: (playerId: string, routes: number | null, tickets: number | null, longest: number | null) => void
  onFinish: () => void
  onRules: () => void
  onQuit: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const leader = standings(game)[0]
  const editing = game.players.find((player) => player.id === editingId) ?? null
  const finishReady = wouldFinish(game)
  const maxTotal = Math.max(1, ...game.players.map((player) => playerTotal(game, player.id)))

  return (
    <SceneShell
      className="play-screen"
      nav={{
        back: { label: 'Ticket to Ride', onClick: onBack },
        title: 'Final scoring',
        subtitle: 'Highest total wins',
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">Tally the map</h1>
      <TtrRace
        threshold={maxTotal}
        scores={game.players.map((player) => ({
          id: player.id,
          total: playerTotal(game, player.id),
          color: playerColor(player).hex,
        }))}
      />
      {leader ? (
        <p className="hint center frost-tile">
          Leading:{' '}
          <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
        </p>
      ) : null}
      <ListSection className="player-scores">
        {game.players.map((player, index) => {
          const color = playerColor(player)
          const score = game.scores[player.id]
          const entered = scoreComplete(score)
          const detail = entered
            ? `Routes ${score?.routes ?? 0} · tickets ${score?.tickets ?? 0} · longest ${score?.longest ?? 0}`
            : 'Routes + tickets + longest'
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
              scoreLabel={entered ? playerTotal(game, player.id) : 'Tap'}
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
        <p className="hint center frost-tile">Tap a player to enter routes, tickets, and the longest-route bonus.</p>
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
        <TtrPad
          playerName={editing.name}
          playerColor={playerColor(editing).hex}
          routes={game.scores[editing.id]?.routes ?? null}
          tickets={game.scores[editing.id]?.tickets ?? null}
          longest={game.scores[editing.id]?.longest ?? null}
          onClose={() => setEditingId(null)}
          onSave={(routes, tickets, longest) => {
            onScore(editing.id, routes, tickets, longest)
            setEditingId(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function TtrPad({
  playerName,
  playerColor,
  routes,
  tickets,
  longest,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  routes: number | null
  tickets: number | null
  longest: number | null
  onSave: (routes: number, tickets: number, longest: number) => void
  onClose: () => void
}) {
  const [field, setField] = useState<PadField>('routes')
  const [routeDigits, setRouteDigits] = useState(routes === null ? '' : String(routes))
  const [ticketDigits, setTicketDigits] = useState(tickets === null ? '' : String(tickets))
  const [longestValue, setLongestValue] = useState(longest ?? 0)
  const routeTotal = routeDigits === '' || routeDigits === '-' ? 0 : Number(routeDigits)
  const ticketTotal = ticketDigits === '' || ticketDigits === '-' ? 0 : Number(ticketDigits)
  const grand = routeTotal + ticketTotal + longestValue

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Points this map"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{scoreHint()}</p>
        <p className="pad-total" aria-live="polite">
          {grand}
          <span>total points</span>
        </p>
        <div className="stepper-row" role="tablist" aria-label="Score fields">
          <Button variant={field === 'routes' ? 'filled' : 'gray'} size="large" onClick={() => setField('routes')}>
            Routes {routeDigits || '0'}
          </Button>
          <Button variant={field === 'tickets' ? 'filled' : 'gray'} size="large" onClick={() => setField('tickets')}>
            Tickets {ticketDigits || '0'}
          </Button>
          <Button variant={field === 'longest' ? 'filled' : 'gray'} size="large" onClick={() => setField('longest')}>
            Longest {longestValue}
          </Button>
        </div>
        {field === 'longest' ? (
          <div className="stepper-row" role="group" aria-label="Longest route bonus">
            <Button variant={longestValue === 0 ? 'filled' : 'gray'} size="large" onClick={() => setLongestValue(0)}>
              0
            </Button>
            <Button
              variant={longestValue === LONGEST_ROUTE_BONUS ? 'filled' : 'gray'}
              size="large"
              onClick={() => setLongestValue(LONGEST_ROUTE_BONUS)}
            >
              +{LONGEST_ROUTE_BONUS}
            </Button>
          </div>
        ) : (
          <DigitPad
            digits={field === 'routes' ? routeDigits : ticketDigits}
            maxLength={3}
            allowMinus={field === 'tickets'}
            onDigits={field === 'routes' ? setRouteDigits : setTicketDigits}
          />
        )}
      </div>
      <div className="sheet-actions">
        <PrimaryButton onClick={() => onSave(routeTotal, ticketTotal, longestValue)}>Lock in {grand}</PrimaryButton>
      </div>
    </Sheet>
  )
}

export function TtrRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Ticket to Ride works',
      }}
    >
      <h2 className="scene-section-title">How Ticket to Ride works</h2>
      <article className="rule-card">
        <h2>The map</h2>
        <TtrMark />
        <p>Claim routes with trains, then score the printed values. Destination tickets pay if you finish them and cost if you don’t.</p>
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

export function TtrWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: TtrGame
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
        back: { label: 'Ticket to Ride', onClick: onBack },
        title: 'Match complete',
        subtitle: 'Highest total',
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
        <TtrMark />
        <p className="eyebrow">End of the line</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Ticket punched'}</h1>
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
        Same table, new map
      </PrimaryButton>
      <GlassButton onClick={onHome}>Back home</GlassButton>
      <GlassButton onClick={onHistory}>Past games</GlassButton>
      <TextButton onClick={onRules}>Review the rules</TextButton>
    </SceneShell>
  )
}

export function TtrHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: TtrRecord) => void
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
          back: { label: 'Ticket to Ride', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'Station board', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'Station board', onClick: onLeaderboard }]}
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search players…" aria-label="Search past games" />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Ticket to Ride games yet.</p>
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

export function TtrLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Ticket to Ride', onClick: onBack },
        title: 'Station board',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Ticket to Ride match and stats will show up here.</p>
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
