import { ListRow, ListSection, SearchBar } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt.ts'
import { GlassButton, PrimaryButton } from './IosChrome.tsx'
import { GameArt } from './GameArt.tsx'
import { searchGames } from './catalog.ts'
import { displayTableLabel, getHouseholdId } from './household.ts'
import { alreadyImported, hasLocalFiveCrowns, importLocalFiveCrowns, peekLocalFiveCrowns } from './importFiveCrowns.ts'
import { cloudAvailable } from './sync.ts'
import type { GameId } from './types.ts'

type GamePickerProps = {
  onChoose: (id: GameId) => void
  onFamilyTable: () => void
}

export function GamePicker({ onChoose, onFamilyTable }: GamePickerProps) {
  const { canInstall, install, installed } = useInstallPrompt()
  const localPeek = useMemo(() => peekLocalFiveCrowns(), [])
  const tableId = useMemo(() => getHouseholdId(), [])
  const tableLabel = displayTableLabel(tableId)
  const showImport = hasLocalFiveCrowns()
  const [query, setQuery] = useState('')
  const [importing, setImporting] = useState(false)
  const [importNote, setImportNote] = useState<string | null>(() =>
    alreadyImported() ? 'Five Crowns games were already imported to Game Night.' : null,
  )
  const matches = useMemo(() => searchGames(query), [query])

  return (
    <section className="screen picker-screen">
      <div className="picker-layout">
        <header className="hero-block picker-hero">
          <p className="eyebrow">Table {tableLabel}</p>
          <h1>Game Night</h1>
          <p className="tagline">Scorekeepers that feel like the apps on your phone — glass, history, and a theme for every game.</p>
        </header>

        <div className="picker-body">
          <ListSection>
            <ListRow
              className="family-table-row"
              disclosure
              separator={false}
              trailing={<span className="family-table-row__id">{tableLabel}</span>}
              onClick={onFamilyTable}
            >
              <span className="family-table-row__copy">
                <strong>Family table</strong>
                <small>Pin or join this household</small>
              </span>
            </ListRow>
          </ListSection>

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search games…"
            aria-label="Search games"
            autoComplete="off"
            enterKeyHint="search"
          />

          {matches.length === 0 ? (
            <p className="hint center history-empty">No games match “{query.trim()}”.</p>
          ) : (
            <div className="game-grid game-grid--cards">
              {matches.map((game) => (
                <ListRow
                  key={game.id}
                  className={`game-tile theme-${game.id}`}
                  leading={<GameArt id={game.id} />}
                  disclosure
                  separator={false}
                  onClick={() => onChoose(game.id)}
                >
                  <span className="game-tile-copy">
                    <span className="eyebrow">{game.tagline}</span>
                    <strong>{game.name}</strong>
                    <span>{game.blurb}</span>
                  </span>
                </ListRow>
              ))}
            </div>
          )}

          {showImport ? (
            <div className="import-panel glass">
              <p>
                Found {localPeek.historyCount} saved Five Crowns {localPeek.historyCount === 1 ? 'game' : 'games'}
                {localPeek.active ? ' plus a table in progress' : ''} on this phone.
              </p>
              <GlassButton
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
              </GlassButton>
              {!cloudAvailable() ? <p className="hint">Cloud sync is not configured on this build.</p> : null}
              {importNote ? <p className="hint">{importNote}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="thumb-dock">
        {canInstall ? (
          <PrimaryButton onClick={() => void install()}>Add to Home Screen</PrimaryButton>
        ) : null}
        {installed ? <p className="install-note">On your Home Screen — works offline at the table.</p> : null}
      </div>
    </section>
  )
}
