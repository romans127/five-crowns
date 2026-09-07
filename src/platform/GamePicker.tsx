import { ListRow, ListSection } from '@ios27_design_system/react'
import { useMemo, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt.ts'
import { GlassButton, PrimaryButton } from './IosChrome.tsx'
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
      <header className="hero-block">
        <p className="eyebrow">Family table</p>
        <h1>Game Night</h1>
        <p className="tagline">Scorekeepers that feel like the apps on your phone — glass, history, and a theme for every game.</p>
      </header>

      <ListSection header="Tonight's table">
        {GAMES.map((game, index) => (
          <ListRow
            key={game.id}
            className={`theme-${game.id}`}
            disclosure
            separator={index < GAMES.length - 1}
            onClick={() => onChoose(game.id)}
          >
            <span className="game-tile-copy">
              <span className="eyebrow">{game.tagline}</span>
              <strong>{game.name}</strong>
              <span>{game.blurb}</span>
            </span>
          </ListRow>
        ))}
      </ListSection>

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

      <div className="thumb-dock">
        {canInstall ? (
          <PrimaryButton onClick={() => void install()}>Add to Home Screen</PrimaryButton>
        ) : null}
        {installed ? <p className="install-note">On your Home Screen — works offline at the table.</p> : null}
      </div>
    </section>
  )
}
