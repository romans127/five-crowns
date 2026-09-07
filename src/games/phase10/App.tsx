import { useEffect, useState } from 'react'
import {
  Phase10History,
  Phase10Home,
  Phase10Leaderboard,
  Phase10Play,
  Phase10Rules,
  Phase10Setup,
  Phase10Winner,
} from './screens.tsx'
import { usePhase10Game } from './useGame.ts'
import type { Phase10Screen } from './types.ts'

type Phase10AppProps = {
  onLeaveGames: () => void
}

export function Phase10App({ onLeaveGames }: Phase10AppProps) {
  const { game, historyCount, refreshHistoryCount, startGame, recordScore, nextRound, clearGame, resumeFromHistory } =
    usePhase10Game()
  const [screen, setScreen] = useState<Phase10Screen>(() => {
    if (!game) {
      return 'home'
    }
    return game.status === 'finished' ? 'winner' : 'play'
  })

  useEffect(() => {
    if (screen === 'home') {
      refreshHistoryCount()
    }
  }, [screen, refreshHistoryCount])

  if (screen === 'history') {
    return (
      <Phase10History
        onBack={() => setScreen('home')}
        onLeaderboard={() => setScreen('leaderboard')}
        onResume={(record) => {
          resumeFromHistory(record)
          setScreen(record.status === 'finished' ? 'winner' : 'play')
        }}
      />
    )
  }

  if (screen === 'leaderboard') {
    return <Phase10Leaderboard onBack={() => setScreen('home')} />
  }

  if (screen === 'rules') {
    return <Phase10Rules onBack={() => setScreen(game ? (game.status === 'finished' ? 'winner' : 'play') : 'home')} />
  }

  if (screen === 'setup') {
    return (
      <Phase10Setup
        onBack={() => setScreen('home')}
        onStart={(names) => {
          startGame(names)
          setScreen('play')
        }}
      />
    )
  }

  if ((screen === 'winner' || (screen === 'play' && game?.status === 'finished')) && game) {
    return (
      <Phase10Winner
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
    return (
      <Phase10Play
        game={game}
        onScore={recordScore}
        onNextRound={() => {
          nextRound()
        }}
        onRules={() => setScreen('rules')}
        onQuit={() => {
          clearGame()
          setScreen('home')
        }}
      />
    )
  }

  return (
    <Phase10Home
      canResume={Boolean(game)}
      historyCount={historyCount}
      onLeaveGames={onLeaveGames}
      onNewGame={() => setScreen('setup')}
      onResume={() => setScreen(game?.status === 'finished' ? 'winner' : 'play')}
      onHistory={() => setScreen('history')}
      onLeaderboard={() => setScreen('leaderboard')}
      onRules={() => setScreen('rules')}
    />
  )
}
