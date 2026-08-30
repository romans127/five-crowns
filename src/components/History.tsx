import { useMemo, useState } from 'react'
import { playerColor, standings, winners } from '../game/engine.ts'
import {
  deleteHistoryGame,
  formatWhen,
  handsRecorded,
  historyHeadline,
  listHistory,
  searchHistory,
} from '../game/history.ts'
import type { GameRecord } from '../game/types.ts'
import { ScoreSheet } from './ScoreSheet.tsx'

type HistoryProps = {
  onBack: () => void
}

export function History({ onBack }: HistoryProps) {
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
      <section className="screen history-screen">
        <header className="screen-head">
          <button type="button" className="btn text" onClick={() => setSelectedId(null)}>
            Back to history
          </button>
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

        <button
          type="button"
          className="btn text quiet"
          onClick={() => {
            deleteHistoryGame(selected.id)
            setRecords(listHistory())
            setSelectedId(null)
          }}
        >
          Delete this game
        </button>
      </section>
    )
  }

  return (
    <section className="screen history-screen">
      <header className="screen-head">
        <button type="button" className="btn text" onClick={onBack}>
          Back home
        </button>
        <h1>Past games</h1>
        <p>Search by player name or browse every saved table on this phone.</p>
      </header>

      <label className="history-search">
        <span className="sr-only">Search past games</span>
        <input
          type="search"
          value={query}
          placeholder="Search players…"
          autoComplete="off"
          enterKeyHint="search"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

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
