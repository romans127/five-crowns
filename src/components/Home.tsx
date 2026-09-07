import { CrownMark, SuitRow } from './Suits.tsx'
import { useInstallPrompt } from '../hooks/useInstallPrompt.ts'

type HomeProps = {
  canResume: boolean
  historyCount: number
  onLeaveGames: () => void
  onNewGame: () => void
  onResume: () => void
  onHistory: () => void
  onLeaderboard: () => void
  onRules: () => void
}

export function Home({
  canResume,
  historyCount,
  onLeaveGames,
  onNewGame,
  onResume,
  onHistory,
  onLeaderboard,
  onRules,
}: HomeProps) {
  const { canInstall, install, installed } = useInstallPrompt()

  return (
    <section className="screen home-screen">
      <header className="nav-bar">
        <button type="button" className="btn text" onClick={onLeaveGames}>
          All games
        </button>
      </header>
      <div className="hero-block">
        <SuitRow size="lg" />
        <CrownMark />
        <p className="eyebrow">Table-side scorekeeper</p>
        <h1>Five Crowns</h1>
        <p className="tagline">The game isn’t over ’til the Kings go wild.</p>
      </div>
      <div className="home-actions">
        <button type="button" className="btn primary pulse" onClick={onNewGame}>
          Deal a new game
        </button>
        <div className="grouped-list">
          {canResume ? (
            <button type="button" className="grouped-row" onClick={onResume}>
              <span>Resume the table</span>
              <span className="chevron">›</span>
            </button>
          ) : null}
          <button type="button" className="grouped-row" onClick={onHistory}>
            <span>Past games{historyCount > 0 ? ` (${historyCount})` : ''}</span>
            <span className="chevron">›</span>
          </button>
          <button type="button" className="grouped-row" onClick={onLeaderboard}>
            <span>Hall of crowns</span>
            <span className="chevron">›</span>
          </button>
          <button type="button" className="grouped-row" onClick={onRules}>
            <span>Look up the rules</span>
            <span className="chevron">›</span>
          </button>
        </div>
      </div>
      {canInstall ? (
        <button type="button" className="install-chip" onClick={() => void install()}>
          Add to Home Screen
        </button>
      ) : null}
      {installed ? <p className="install-note">Installed — play it like an app, even offline.</p> : null}
    </section>
  )
}
