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
import { SceneShell, SceneStage } from '../platform/SceneNav.tsx'
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
  const [detailTransition, setDetailTransition] = useState<'forward' | 'back' | 'none'>('none')

  const filtered = useMemo(() => searchHistory(records, query), [records, query])

  const selected = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  )

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
    const rows = standings(selected)
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
          back: { label: 'Five Crowns', onClick: onBack },
          title: 'Past games',
          subtitle: 'Saved tables on this phone',
          actions: [{ label: 'Hall of crowns', onClick: onLeaderboard }],
        }}
      >
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
              <HistoryRow key={record.id} record={record} onOpen={() => openDetail(record.id)} />
            ))}
          </ol>
        )}
      </SceneShell>
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
