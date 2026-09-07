import { useEffect, useState } from 'react'
import { FiveCrownsApp } from './FiveCrownsApp.tsx'
import { Phase10App } from './games/phase10/App.tsx'
import { GamePicker } from './platform/GamePicker.tsx'
import type { GameId } from './platform/types.ts'

export default function App() {
  const [selected, setSelected] = useState<GameId | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = selected ?? 'game-night'
    document.documentElement.style.colorScheme = 'dark'
  }, [selected])

  if (selected === 'five-crowns') {
    return <FiveCrownsApp onLeaveGames={() => setSelected(null)} />
  }

  if (selected === 'phase-10') {
    return <Phase10App onLeaveGames={() => setSelected(null)} />
  }

  return <GamePicker onChoose={setSelected} />
}
