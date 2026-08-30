import { CrownMark, SuitRow } from './Suits.tsx'
import { useInstallPrompt } from '../hooks/useInstallPrompt.ts'

type HomeProps = {
  canResume: boolean
  historyCount: number
  onNewGame: () => void
  onResume: () => void
  onHistory: () => void
  onRules: () => void
}

export function Home({ canResume, historyCount, onNewGame, onResume, onHistory, onRules }: HomeProps) {
  const { canInstall, install, installed } = useInstallPrompt()

  return (
    <section className="screen home-screen">
      <SuitRow size="lg" />
      <CrownMark />
      <p className="eyebrow">Table-side scorekeeper</p>
      <h1>Five Crowns</h1>
      <p className="tagline">The game isn’t over ’til the Kings go wild.</p>
      <div className="home-actions">
        <button type="button" className="btn primary pulse" onClick={onNewGame}>
          Deal a new game
        </button>
        {canResume ? (
          <button type="button" className="btn ghost" onClick={onResume}>
            Resume the table
          </button>
        ) : null}
        <button type="button" className="btn ghost" onClick={onHistory}>
          Past games{historyCount > 0 ? ` (${historyCount})` : ''}
        </button>
        <button type="button" className="btn text" onClick={onRules}>
          Look up the rules
        </button>
      </div>
      {canInstall ? (
        <button type="button" className="install-chip" onClick={() => void install()}>
          Install on this phone
        </button>
      ) : null}
      {installed ? <p className="install-note">Installed — play it like an app, even offline.</p> : null}
    </section>
  )
}
