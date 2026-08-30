import { useState } from 'react'
import { History } from './components/History.tsx'
import { Home } from './components/Home.tsx'
import { Play } from './components/Play.tsx'
import { Rules } from './components/Rules.tsx'
import { Setup } from './components/Setup.tsx'
import { Winner } from './components/Winner.tsx'
import { useGame } from './hooks/useGame.ts'
import type { Screen } from './game/types.ts'

export default function App() {
  const { game, historyCount, refreshHistoryCount, startGame, recordScore, nextHand, selectHand, clearGame } =
    useGame()
  const [screen, setScreen] = useState<Screen>(() => {
    if (!game) {
      return 'home'
    }
    return game.status === 'finished' ? 'winner' : 'play'
  })

  const goHome = () => setScreen('home')

  if (screen === 'history') {
    return (
      <History
        onBack={() => {
          refreshHistoryCount()
          setScreen('home')
        }}
      />
    )
  }

  if (screen === 'rules') {
    return <Rules onBack={() => setScreen(game ? (game.status === 'finished' ? 'winner' : 'play') : 'home')} />
  }

  if (screen === 'setup') {
    return (
      <Setup
        onBack={goHome}
        onStart={(names) => {
          startGame(names)
          setScreen('play')
        }}
      />
    )
  }

  if (screen === 'winner' && game) {
    return (
      <Winner
        game={game}
        onHome={() => {
          clearGame()
          setScreen('home')
        }}
        onPlayAgain={(names) => {
          startGame(names)
          setScreen('play')
        }}
        onRules={() => setScreen('rules')}
        onHistory={() => setScreen('history')}
      />
    )
  }

  if (screen === 'play' && game) {
    if (game.status === 'finished') {
      return (
        <Winner
          game={game}
          onHome={() => {
            clearGame()
            setScreen('home')
          }}
          onPlayAgain={(names) => {
            startGame(names)
            setScreen('play')
          }}
          onRules={() => setScreen('rules')}
          onHistory={() => setScreen('history')}
        />
      )
    }
    return (
      <Play
        game={game}
        onScore={recordScore}
        onNextHand={() => {
          nextHand()
          if (game.currentHand === 10) {
            setScreen('winner')
          }
        }}
        onSelectHand={selectHand}
        onRules={() => setScreen('rules')}
        onQuit={() => {
          clearGame()
          setScreen('home')
        }}
      />
    )
  }

  return (
    <Home
      canResume={Boolean(game)}
      historyCount={historyCount}
      onNewGame={() => setScreen('setup')}
      onResume={() => setScreen(game?.status === 'finished' ? 'winner' : 'play')}
      onHistory={() => setScreen('history')}
      onRules={() => setScreen('rules')}
    />
  )
}
