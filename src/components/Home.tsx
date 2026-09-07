import { useInstallPrompt } from '../hooks/useInstallPrompt.ts'
import { ActionList, PrimaryButton, TextButton } from '../platform/IosChrome.tsx'
import { CrownMark, SuitRow } from './Suits.tsx'

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
        <TextButton onClick={onLeaveGames}>All games</TextButton>
      </header>
      <div className="hero-block">
        <SuitRow size="lg" />
        <CrownMark />
        <p className="eyebrow">Table-side scorekeeper</p>
        <h1>Five Crowns</h1>
        <p className="tagline">The game isn’t over ’til the Kings go wild.</p>
      </div>
      <div className="home-actions">
        <PrimaryButton className="pulse" onClick={onNewGame}>
          Deal a new game
        </PrimaryButton>
        <ActionList
          items={[
            ...(canResume ? [{ label: 'Resume the table', onClick: onResume }] : []),
            { label: historyCount > 0 ? `Past games (${historyCount})` : 'Past games', onClick: onHistory },
            { label: 'Hall of crowns', onClick: onLeaderboard },
            { label: 'Look up the rules', onClick: onRules },
          ]}
        />
      </div>
      {canInstall ? (
        <PrimaryButton onClick={() => void install()}>Add to Home Screen</PrimaryButton>
      ) : null}
      {installed ? <p className="install-note">Installed — play it like an app, even offline.</p> : null}
    </section>
  )
}
