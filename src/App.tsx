import { useEffect, useState, type ReactNode } from 'react'
import { FiveCrownsApp } from './FiveCrownsApp.tsx'
import { Phase10App } from './games/phase10/App.tsx'
import { YahtzeeApp } from './games/yahtzee/App.tsx'
import { UnoApp } from './games/uno/App.tsx'
import { CribbageApp } from './games/cribbage/App.tsx'
import { HeartsApp } from './games/hearts/App.tsx'
import { GinApp } from './games/gin-rummy/App.tsx'
import { FarkleApp } from './games/farkle/App.tsx'
import { QwixxApp } from './games/qwixx/App.tsx'
import { DealApp } from './games/monopoly-deal/App.tsx'
import { SorryApp } from './games/sorry/App.tsx'
import { TtrApp } from './games/ticket-to-ride/App.tsx'
import { SequenceApp } from './games/sequence/App.tsx'
import { FamilyTableScreen } from './platform/FamilyTable.tsx'
import { GamePicker } from './platform/GamePicker.tsx'
import { AppBackground } from './platform/AppBackground.tsx'
import { SwipeBack } from './platform/SwipeBack.tsx'
import type { GameId } from './platform/types.ts'

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppBackground />
      {children}
    </div>
  )
}

function GameApp({ id, onLeave }: { id: GameId; onLeave: () => void }) {
  switch (id) {
    case 'five-crowns':
      return <FiveCrownsApp onLeaveGames={onLeave} />
    case 'phase-10':
      return <Phase10App onLeaveGames={onLeave} />
    case 'yahtzee':
      return <YahtzeeApp onLeaveGames={onLeave} />
    case 'uno':
      return <UnoApp onLeaveGames={onLeave} />
    case 'cribbage':
      return <CribbageApp onLeaveGames={onLeave} />
    case 'hearts':
      return <HeartsApp onLeaveGames={onLeave} />
    case 'gin-rummy':
      return <GinApp onLeaveGames={onLeave} />
    case 'farkle':
      return <FarkleApp onLeaveGames={onLeave} />
    case 'qwixx':
      return <QwixxApp onLeaveGames={onLeave} />
    case 'monopoly-deal':
      return <DealApp onLeaveGames={onLeave} />
    case 'sorry':
      return <SorryApp onLeaveGames={onLeave} />
    case 'ticket-to-ride':
      return <TtrApp onLeaveGames={onLeave} />
    case 'sequence':
      return <SequenceApp onLeaveGames={onLeave} />
    default: {
      const _never: never = id
      return _never
    }
  }
}

export default function App() {
  const [selected, setSelected] = useState<GameId | null>(null)
  const [showFamilyTable, setShowFamilyTable] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.dataset.gameTheme = selected ?? 'game-night'
    document.documentElement.style.colorScheme = 'dark'
  }, [selected])

  if (selected) {
    return (
      <AppShell>
        <GameApp id={selected} onLeave={() => setSelected(null)} />
      </AppShell>
    )
  }

  if (showFamilyTable) {
    return (
      <AppShell>
        <SwipeBack onBack={() => setShowFamilyTable(false)}>
          <FamilyTableScreen onBack={() => setShowFamilyTable(false)} />
        </SwipeBack>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <SwipeBack onBack={() => undefined} enabled={false}>
        <GamePicker onChoose={setSelected} onFamilyTable={() => setShowFamilyTable(true)} />
      </SwipeBack>
    </AppShell>
  )
}
