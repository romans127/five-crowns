import { SearchBar } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { playerColor, standings, winners } from '../game/engine.ts'
import {
  canResumeFromHistory,
  deleteHistoryGame,
  formatWhen,
  handsRecorded,
  historyHeadline,
  listHistory,
  searchHistory,
} from '../game/history.ts'
import type { GameRecord } from '../game/types.ts'
import { PrimaryButton, TextButton } from '../platform/IosChrome.tsx'
import { SwipeBack } from '../platform/SwipeBack.tsx'
import { ScoreSheet } from './ScoreSheet.tsx'

type HistoryProps = {
  onBack: () => void
  onLeaderboard: () => void
  onResume: (record: GameRecord) => void
}

export function History({ onBack, onLeaderboard, onResume }: HistoryProps) {
  const [records, setRecords] = useState(() => listHistory())
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => searchHistory(records, query), [records, query])

  const selected = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  )

  if (selected) {
    const champs = winners(selected)
    const rows = standings(selected)
    return (
      <SwipeBack onBack={() => setSelectedId(null)}>
        <section className="screen history-screen">
        <header className="screen-head">
          <TextButton onClick={() => setSelectedId(null)}>Back to history</TextButton>
          <h1>Game detail</h1>
          <p>{formatWhen(selected.archivedAt)}</p>
        </header>

        <article className="history-detail-card">
          <p className="eyebrow">{selected.status === 'finished' ? 'Completed match' : 'Stopped early'}</p>
          <h2>{historyHeadline(selected)}</h2>
          {selected.status === 'finished' && champs.length > 0 ? (
            <p className="champs compact">
              {champs.map((player) => (
                <span key={player.id} style={{ color: playerColor(player).hex }}>
                  {player.name}
                </span>
              ))}
            </p>
          ) : null}
          <ol className="final-standings compact">
            {rows.map((row, index) => (
              <li key={row.player.id}>
                <span className="place">{index + 1}</span>
                <strong style={{ color: playerColor(row.player).hex }}>{row.player.name}</strong>
                <span>{row.total}</span>
              </li>
            ))}
          </ol>
        </article>

        <ScoreSheet game={selected} />

        {canResumeFromHistory(selected) ? (
          <PrimaryButton onClick={() => onResume(selected)}>Resume this table</PrimaryButton>
        ) : null}

        <TextButton
          className="quiet"
          onClick={() => {
            deleteHistoryGame(selected.id)
            setRecords(listHistory())
            setSelectedId(null)
          }}
        >
          Delete this game
        </TextButton>
        </section>
      </SwipeBack>
    )
  }

  return (
    <SwipeBack onBack={onBack}>
      <section className="screen history-screen">
      <header className="screen-head">
        <TextButton onClick={onBack}>Back home</TextButton>
        <h1>Past games</h1>
        <p>Search by player name or browse every saved table on this phone.</p>
        <TextButton onClick={onLeaderboard}>Hall of crowns</TextButton>
      </header>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search players…"
        aria-label="Search past games"
        autoComplete="off"
        enterKeyHint="search"
      />

      {records.length === 0 ? (
        <p className="hint center history-empty">No saved games yet. Finish a match and it will show up here.</p>
      ) : filtered.length === 0 ? (
        <p className="hint center history-empty">No games match “{query.trim()}”.</p>
      ) : (
        <ol className="history-list">
          {filtered.map((record) => (
            <HistoryRow key={record.id} record={record} onOpen={() => setSelectedId(record.id)} />
          ))}
        </ol>
      )}
      </section>
    </SwipeBack>
  )
}

function HistoryRow({ record, onOpen }: { record: GameRecord; onOpen: () => void }) {
  const champs = winners(record)
  return (
    <li>
      <button type="button" className="history-row" onClick={onOpen}>
        <span className="history-when">{formatWhen(record.archivedAt)}</span>
        <strong>{historyHeadline(record)}</strong>
        <span className="history-meta">
          {record.status === 'finished'
            ? champs.length > 0
              ? `${champs.map((player) => player.name).join(' & ')} won`
              : 'Completed'
            : `Stopped after hand ${handsRecorded(record)}`}
        </span>
      </button>
    </li>
  )
}
