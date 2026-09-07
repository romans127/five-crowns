import { useEffect, useState, type ReactNode } from 'react'
import { FiveCrownsApp } from './FiveCrownsApp.tsx'
import { Phase10App } from './games/phase10/App.tsx'
import { GamePicker } from './platform/GamePicker.tsx'
import type { GameId } from './platform/types.ts'

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />
      <div className="orb orb-c" aria-hidden="true" />
      <div className="orb orb-d" aria-hidden="true" />
      {children}
    </div>
  )
}

export default function App() {
  const [selected, setSelected] = useState<GameId | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.dataset.gameTheme = selected ?? 'game-night'
    document.documentElement.style.colorScheme = 'dark'
  }, [selected])

  if (selected === 'five-crowns') {
    return (
      <AppShell>
        <FiveCrownsApp onLeaveGames={() => setSelected(null)} />
      </AppShell>
    )
  }

  if (selected === 'phase-10') {
    return (
      <AppShell>
        <Phase10App onLeaveGames={() => setSelected(null)} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <GamePicker onChoose={setSelected} />
    </AppShell>
  )
}
