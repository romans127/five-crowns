import { Button, ListRow, ListSection, SearchBar, Sheet } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { ActionList, GlassButton, HistoryGameRow, PlayerNameField, PrimaryButton, TextButton, TintedButton } from '../../platform/IosChrome.tsx'
import { SceneShell, SceneStage } from '../../platform/SceneNav.tsx'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { DiceRow, YahtzeeMark } from './Brand.tsx'
import { playerColor, playerTotals, scorecardComplete, standings, winners } from './engine.ts'
import {
  CATEGORY_RULES,
  LOWER_RULES,
  UPPER_BONUS,
  UPPER_BONUS_THRESHOLD,
  UPPER_RULES,
  YAHTZEE_BONUS,
  YAHTZEE_SCORE,
  type CategoryRule,
} from './rules.ts'
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
  CATEGORY_COUNT,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type CategoryId,
  type YahtzeeGame,
  type YahtzeeRecord,
} from './types.ts'

export function YahtzeeHome({
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
    { label: 'High rollers', onClick: onLeaderboard },
    { label: 'Rules', onClick: onRules },
  ]

  return (
    <SceneShell
      className="home-screen"
      nav={{
        back: { label: 'All games', onClick: onLeaveGames },
        title: 'Yahtzee',
        subtitle: 'Classic score pad',
      }}
      flowLinks={flowLinks}
    >
      <div className="hero-block">
        <DiceRow size="lg" />
        <YahtzeeMark />
        <p className="eyebrow">Classic pad</p>
        <h2 className="hero-display">Yahtzee</h2>
        <p className="tagline">Thirteen boxes. Highest grand total wins.</p>
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

export function YahtzeeSetup({ onBack, onStart }: { onBack: () => void; onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['', ''])
  const readyNames = names.map((name) => name.trim()).filter(Boolean)

  return (
    <SceneShell
      className="setup-screen"
      nav={{
        back: { label: 'Yahtzee', onClick: onBack },
        title: 'New table',
        subtitle: 'Who’s rolling?',
      }}
    >
      <p className="hint">Two to eight players. Roll real dice — this pad records the thirteen boxes.</p>
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

function scoreCell(value: number | null): string {
  return typeof value === 'number' ? String(value) : '—'
}

export function YahtzeePlay({
  game,
  onBack,
  onScore,
  onBonuses,
  onRules,
  onQuit,
}: {
  game: YahtzeeGame
  onBack: () => void
  onScore: (playerId: string, category: CategoryId, score: number | null) => void
  onBonuses: (playerId: string, count: number) => void
  onRules: () => void
  onQuit: () => void
}) {
  const [selectedId, setSelectedId] = useState(game.players[0]?.id ?? '')
  const [editing, setEditing] = useState<CategoryId | 'bonus' | null>(null)
  const selected = game.players.find((player) => player.id === selectedId) ?? game.players[0]
  const leader = standings(game)[0]
  const totals = selected ? playerTotals(selected) : null
  const remaining = game.players.filter((player) => !scorecardComplete(player))

  if (!selected || !totals) {
    return null
  }

  const color = playerColor(selected)
  const editingRule = editing && editing !== 'bonus' ? CATEGORY_RULES[editing] : null

  return (
    <SceneShell
      className="play-screen yz-play"
      nav={{
        back: { label: 'Yahtzee', onClick: onBack },
        title: 'Scorecard',
        subtitle: `${totals.filled} of ${CATEGORY_COUNT} boxes`,
        actions: [{ label: 'Rules', onClick: onRules }],
      }}
    >
      <h1 className="play-title">{selected.name}</h1>
      <DiceRow size="sm" values={[1, 2, 3, 5, 6]} />
      {leader ? (
        <p className="hint center frost-tile">
          Leading: <strong style={{ color: playerColor(leader.player).hex }}>{leader.player.name}</strong> · {leader.total}
        </p>
      ) : null}
      {game.players.length > 1 ? (
        <div className="yz-player-switch" role="tablist" aria-label="Players">
          {game.players.map((player) => {
            const card = playerTotals(player)
            const active = player.id === selected.id
            return (
              <Button
                key={player.id}
                variant={active ? 'filled' : 'tinted'}
                size="small"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedId(player.id)}
              >
                {player.name} · {card.grandTotal}
              </Button>
            )
          })}
        </div>
      ) : null}

      <ListSection header="Upper section" className="yz-scorecard">
        {UPPER_RULES.map((rule, index) => (
          <CategoryRow
            key={rule.id}
            rule={rule}
            value={selected.scores[rule.id]}
            separator={index < UPPER_RULES.length - 1}
            onClick={() => setEditing(rule.id)}
          />
        ))}
      </ListSection>

      <ListSection header="Upper totals" className="yz-scorecard">
        <ListRow trailing={<span className="hand-score in">{totals.upperSubtotal}</span>} separator>
          <span className="player-meta">
            <strong>Subtotal</strong>
            <small>Aces through sixes</small>
          </span>
        </ListRow>
        <ListRow
          trailing={
            <span className={`hand-score ${totals.upperBonus > 0 ? 'in' : 'open'}`}>
              {totals.upperBonus > 0 ? totals.upperBonus : `${totals.bonusNeeded} to ${UPPER_BONUS_THRESHOLD}`}
            </span>
          }
          separator
        >
          <span className="player-meta">
            <strong>Bonus</strong>
            <small>{UPPER_BONUS_THRESHOLD} or more earns +{UPPER_BONUS}</small>
          </span>
        </ListRow>
        <ListRow trailing={<span className="hand-score in">{totals.upperTotal}</span>} separator={false}>
          <span className="player-meta">
            <strong>Upper total</strong>
            <small>Subtotal plus bonus</small>
          </span>
        </ListRow>
      </ListSection>

      <ListSection header="Lower section" className="yz-scorecard">
        {LOWER_RULES.map((rule) => (
          <CategoryRow
            key={rule.id}
            rule={rule}
            value={selected.scores[rule.id]}
            separator
            onClick={() => setEditing(rule.id)}
          />
        ))}
        <ListRow
          trailing={
            <span className={`hand-score ${totals.yahtzeeBonusPoints > 0 ? 'in' : 'open'}`}>
              {totals.yahtzeeBonusPoints > 0 ? totals.yahtzeeBonusPoints : '—'}
            </span>
          }
          separator={false}
          onClick={() => setEditing('bonus')}
        >
          <span className="player-meta">
            <strong>Yahtzee bonus</strong>
            <small>
              {selected.scores.yahtzee === YAHTZEE_SCORE
                ? `${selected.yahtzeeBonuses} × ${YAHTZEE_BONUS}`
                : selected.scores.yahtzee === 0
                  ? 'No bonus after a scratch'
                  : 'Score 50 in Yahtzee first'}
            </small>
          </span>
        </ListRow>
      </ListSection>

      <ListSection header="Grand total" className="yz-scorecard">
        <ListRow trailing={<span className="hand-score in">{totals.grandTotal}</span>} separator={false}>
          <span className="player-meta">
            <strong style={{ color: color.hex }}>{selected.name}</strong>
            <small>
              {scorecardComplete(selected)
                ? 'Card complete'
                : `${CATEGORY_COUNT - totals.filled} boxes left`}
            </small>
          </span>
        </ListRow>
      </ListSection>

      {remaining.length === 0 ? (
        <p className="hint center frost-tile">Every box is filled. Highest grand total takes the table.</p>
      ) : (
        <p className="hint center frost-tile">
          Tap an empty box to enter a score.
          {remaining.length < game.players.length
            ? ` Still rolling: ${remaining.map((player) => player.name).join(', ')}.`
            : ''}
        </p>
      )}
      <TextButton className="quiet" onClick={onQuit}>
        Leave table
      </TextButton>

      {editingRule ? (
        <YahtzeePad
          playerName={selected.name}
          playerColor={color.hex}
          rule={editingRule}
          currentScore={selected.scores[editingRule.id]}
          onClose={() => setEditing(null)}
          onSave={(score) => {
            onScore(selected.id, editingRule.id, score)
            setEditing(null)
          }}
        />
      ) : null}
      {editing === 'bonus' ? (
        <YahtzeeBonusPad
          playerName={selected.name}
          playerColor={color.hex}
          yahtzeeScore={selected.scores.yahtzee}
          currentBonuses={selected.yahtzeeBonuses}
          onClose={() => setEditing(null)}
          onSave={(count) => {
            onBonuses(selected.id, count)
            setEditing(null)
          }}
        />
      ) : null}
    </SceneShell>
  )
}

function CategoryRow({
  rule,
  value,
  separator,
  onClick,
}: {
  rule: CategoryRule
  value: number | null
  separator: boolean
  onClick: () => void
}) {
  const entered = typeof value === 'number'
  return (
    <ListRow
      trailing={<span className={`hand-score ${entered ? 'in' : 'open'}`}>{scoreCell(value)}</span>}
      separator={separator}
      onClick={onClick}
    >
      <span className="player-meta">
        <strong>{rule.label}</strong>
        <small>{rule.hint}</small>
      </span>
    </ListRow>
  )
}

function YahtzeePad({
  playerName,
  playerColor,
  rule,
  currentScore,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  rule: CategoryRule
  currentScore: number | null
  onSave: (score: number) => void
  onClose: () => void
}) {
  const [digits, setDigits] = useState(currentScore === null ? '' : String(currentScore))
  const total = digits === '' ? 0 : Number(digits)
  const maxDigits = String(rule.max).length

  const append = (key: string) => {
    setDigits((current) => (current + key).replace(/^0+(?=\d)/, '').slice(0, maxDigits))
  }

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title={rule.label}
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">{rule.hint}</p>
        <p className="pad-total" aria-live="polite">
          {digits === '' ? '0' : digits}
          <span>points</span>
        </p>
        {rule.kind === 'fixed' ? (
          <div className="yz-score-chips">
            <TintedButton onClick={() => setDigits(String(rule.fixedScore))}>Score {rule.fixedScore}</TintedButton>
            <TintedButton onClick={() => setDigits('0')}>Scratch 0</TintedButton>
          </div>
        ) : null}
        {rule.kind === 'upper' ? (
          <div className="yz-score-chips">
            <TintedButton onClick={() => setDigits(String(rule.face * 3))}>
              3 × {rule.face} = {rule.face * 3}
            </TintedButton>
            <TintedButton onClick={() => setDigits('0')}>Scratch 0</TintedButton>
          </div>
        ) : null}
        {rule.kind === 'sum' ? (
          <div className="yz-score-chips">
            <TintedButton onClick={() => setDigits('0')}>Scratch 0</TintedButton>
          </div>
        ) : null}
        <div className="keypad" aria-label="Score keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <Button
              key={key}
              variant="gray"
              size="large"
              className="keypad-digit"
              onClick={() => append(key)}
            >
              {key}
            </Button>
          ))}
          <span className="keypad-spacer" aria-hidden="true" />
          <Button variant="gray" size="large" className="keypad-digit" onClick={() => append('0')}>
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
      </div>
      <div className="sheet-actions">
        <TintedButton onClick={() => onSave(0)}>Scratch 0</TintedButton>
        <PrimaryButton onClick={() => onSave(total)}>Lock in {total}</PrimaryButton>
      </div>
    </Sheet>
  )
}

function YahtzeeBonusPad({
  playerName,
  playerColor,
  yahtzeeScore,
  currentBonuses,
  onSave,
  onClose,
}: {
  playerName: string
  playerColor: string
  yahtzeeScore: number | null
  currentBonuses: number
  onSave: (count: number) => void
  onClose: () => void
}) {
  const [count, setCount] = useState(currentBonuses)
  const allowed = yahtzeeScore === YAHTZEE_SCORE

  return (
    <Sheet
      open
      className="score-pad-sheet"
      onChange={(next) => {
        if (!next) onClose()
      }}
      detent="large"
      title="Yahtzee bonus"
    >
      <div className="score-pad-body">
        <p className="score-pad-player" style={{ color: playerColor }}>
          {playerName}
        </p>
        <p className="pad-limit">
          After a 50 in the Yahtzee box, each extra Yahtzee is +{YAHTZEE_BONUS}. Then fill another box as a joker
          (the table decides the box).
        </p>
        <p className="pad-total" aria-live="polite">
          {allowed ? count * YAHTZEE_BONUS : 0}
          <span>{allowed ? `${count} bonus Yahtzees` : 'Bonus locked'}</span>
        </p>
        <div className="yz-score-chips">
          <TintedButton disabled={!allowed || count <= 0} onClick={() => setCount((current) => Math.max(0, current - 1))}>
            −
          </TintedButton>
          <TintedButton disabled={!allowed} onClick={() => setCount((current) => Math.min(12, current + 1))}>
            +
          </TintedButton>
        </div>
      </div>
      <div className="sheet-actions">
        <PrimaryButton disabled={!allowed} onClick={() => onSave(count)}>
          Lock in {count * YAHTZEE_BONUS}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}

export function YahtzeeRules({ onBack, backLabel = 'Table' }: { onBack: () => void; backLabel?: string }) {
  return (
    <SceneShell
      className="rules-screen"
      nav={{
        back: { label: backLabel, onClick: onBack },
        title: 'Rules',
        subtitle: 'How Yahtzee works',
      }}
    >
      <h2 className="scene-section-title">Official score pad</h2>
      <article className="rule-card">
        <h2>A turn</h2>
        <p>
          Roll five dice up to three times. After the turn, fill exactly one empty box. Boxes can be completed in
          any order. If nothing fits, scratch a box with zero.
        </p>
      </article>
      <article className="rule-card">
        <h2>Upper section</h2>
        <ol className="wild-list">
          {UPPER_RULES.map((rule) => (
            <li key={rule.id}>
              <strong>{rule.label}</strong>
              <span>Sum of {rule.face}s only · max {rule.max}</span>
            </li>
          ))}
        </ol>
        <p>
          If the upper subtotal is {UPPER_BONUS_THRESHOLD} or more, add a {UPPER_BONUS}-point bonus. Three of each
          number (3, 6, 9, 12, 15, 18) is the usual path to 63.
        </p>
      </article>
      <article className="rule-card">
        <h2>Lower section</h2>
        <ol className="wild-list">
          <li>
            <strong>3 of a kind</strong>
            <span>Total of all five dice</span>
          </li>
          <li>
            <strong>4 of a kind</strong>
            <span>Total of all five dice</span>
          </li>
          <li>
            <strong>Full house</strong>
            <span>{CATEGORY_RULES.fullHouse.max} points</span>
          </li>
          <li>
            <strong>Small straight</strong>
            <span>{CATEGORY_RULES.smallStraight.max} points</span>
          </li>
          <li>
            <strong>Large straight</strong>
            <span>{CATEGORY_RULES.largeStraight.max} points</span>
          </li>
          <li>
            <strong>Yahtzee</strong>
            <span>{YAHTZEE_SCORE} points for five of a kind</span>
          </li>
          <li>
            <strong>Chance</strong>
            <span>Total of all five dice</span>
          </li>
        </ol>
      </article>
      <article className="rule-card">
        <h2>Yahtzee bonus & jokers</h2>
        <p>
          If the Yahtzee box already has {YAHTZEE_SCORE}, each later Yahtzee scores +{YAHTZEE_BONUS} on the bonus
          row. A scratch (0) in Yahtzee blocks later bonuses.
        </p>
        <p>
          Official joker order is not enforced here: after taking a bonus, pick any remaining box yourself. Official
          Hasbro order is the matching upper box first, then any open lower box at its usual score, or a forced
          zero in an open upper box if everything else is full.
        </p>
      </article>
      <article className="rule-card">
        <h2>Winning</h2>
        <p>
          After every player fills all {CATEGORY_COUNT} boxes, add upper total, lower total, and Yahtzee bonuses.
          Highest grand total wins. Ties stand.
        </p>
      </article>
    </SceneShell>
  )
}

export function YahtzeeWinner({
  game,
  onBack,
  onHome,
  onPlayAgain,
  onRules,
  onHistory,
}: {
  game: YahtzeeGame
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
        back: { label: 'Yahtzee', onClick: onBack },
        title: 'Match complete',
        subtitle: 'Highest total wins',
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
        <DiceRow size="md" />
        <YahtzeeMark />
        <p className="eyebrow">Pad complete</p>
        <h1>{champs.length > 1 ? 'Shared win!' : 'Yahtzee!'}</h1>
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

export function YahtzeeHistory({
  onBack,
  onLeaderboard,
  onResume,
}: {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: YahtzeeRecord) => void
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
          back: { label: 'Yahtzee', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved on this phone',
          actions: [{ label: 'High rollers', onClick: onLeaderboard }],
        }}
        flowLinks={[{ label: 'High rollers', onClick: onLeaderboard }]}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search players…"
          aria-label="Search past games"
        />
        {filtered.length === 0 ? (
          <p className="hint center history-empty">No saved Yahtzee games yet.</p>
        ) : (
          <ListSection className="history-list">
            {filtered.map((record, index) => (
              <HistoryGameRow
                key={record.id}
                when={formatWhen(record.archivedAt)}
                headline={historyHeadline(record)}
                meta={historyMeta(record)}
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

export function YahtzeeLeaderboard({ onBack }: { onBack: () => void }) {
  const entries = useMemo(() => buildLeaderboard(listHistory()), [])
  const crowns = sortByWins(entries).filter((entry) => entry.wins > 0)
  const lanterns = sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0)

  return (
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Yahtzee', onClick: onBack },
        title: 'High rollers',
        subtitle: 'Wins and last-place finishes',
      }}
    >
      {entries.length === 0 ? (
        <p className="hint center history-empty">Finish a Yahtzee match and stats will show up here.</p>
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
