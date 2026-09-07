import { useMemo, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt.ts'
import { GAMES } from './catalog.ts'
import { alreadyImported, hasLocalFiveCrowns, importLocalFiveCrowns, peekLocalFiveCrowns } from './importFiveCrowns.ts'
import { cloudAvailable } from './sync.ts'
import type { GameId } from './types.ts'

type GamePickerProps = {
  onChoose: (id: GameId) => void
}

export function GamePicker({ onChoose }: GamePickerProps) {
  const { canInstall, install, installed } = useInstallPrompt()
  const localPeek = useMemo(() => peekLocalFiveCrowns(), [])
  const showImport = hasLocalFiveCrowns()
  const [importing, setImporting] = useState(false)
  const [importNote, setImportNote] = useState<string | null>(() =>
    alreadyImported() ? 'Five Crowns games were already imported to Game Night.' : null,
  )

  return (
    <section className="screen picker-screen">
      <p className="eyebrow">Table-side scorekeepers</p>
      <h1>Game Night</h1>
      <p className="tagline">Pick a game. Each table keeps its own scores, history, and theme.</p>

      <ol className="game-grid">
        {GAMES.map((game) => (
          <li key={game.id}>
            <button type="button" className={`game-tile theme-${game.id}`} onClick={() => onChoose(game.id)}>
              <span className="eyebrow">{game.tagline}</span>
              <strong>{game.name}</strong>
              <span>{game.blurb}</span>
            </button>
          </li>
        ))}
      </ol>

      {showImport ? (
        <div className="import-panel">
          <p>
            Found {localPeek.historyCount} saved Five Crowns {localPeek.historyCount === 1 ? 'game' : 'games'}
            {localPeek.active ? ' plus a table in progress' : ''} on this phone.
          </p>
          <button
            type="button"
            className="btn ghost"
            disabled={importing || !cloudAvailable()}
            onClick={() => {
              setImporting(true)
              void importLocalFiveCrowns()
                .then((result) => {
                  setImportNote(
                    result.imported === 0
                      ? 'Nothing new to import.'
                      : `Imported ${result.imported} Five Crowns ${result.imported === 1 ? 'game' : 'games'} to Game Night.`,
                  )
                })
                .catch(() => {
                  setImportNote('Import failed. Try again with a connection.')
                })
                .finally(() => {
                  setImporting(false)
                })
            }}
          >
            {importing ? 'Importing…' : 'Import Five Crowns games'}
          </button>
          {!cloudAvailable() ? <p className="hint">Cloud sync is not configured on this build.</p> : null}
          {importNote ? <p className="hint">{importNote}</p> : null}
        </div>
      ) : null}

      {canInstall ? (
        <button type="button" className="install-chip" onClick={() => void install()}>
          Install on this phone
        </button>
      ) : null}
      {installed ? <p className="install-note">Installed — Game Night works like an app, even offline.</p> : null}
    </section>
  )
}
