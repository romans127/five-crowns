import { useEffect, useState } from 'react'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
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

  const goHome = () => setScreen('home')
  const goRulesBack = () => setScreen(game ? (game.status === 'finished' ? 'winner' : 'play') : 'home')
  const goWinnerHome = () => {
    clearGame()
    setScreen('home')
  }

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
    return (
      <SwipeBack onBack={goHome}>
        <Phase10Leaderboard onBack={goHome} />
      </SwipeBack>
    )
  }

  if (screen === 'rules') {
    return (
      <SwipeBack onBack={goRulesBack}>
        <Phase10Rules onBack={goRulesBack} />
      </SwipeBack>
    )
  }

  if (screen === 'setup') {
    return (
      <SwipeBack onBack={goHome}>
        <Phase10Setup
          onBack={goHome}
          onStart={(names) => {
            startGame(names)
            setScreen('play')
          }}
        />
      </SwipeBack>
    )
  }

  if ((screen === 'winner' || (screen === 'play' && game?.status === 'finished')) && game) {
    return (
      <SwipeBack onBack={goWinnerHome}>
        <Phase10Winner
          game={game}
          onHome={goWinnerHome}
          onPlayAgain={(names) => {
            startGame(names)
            setScreen('play')
          }}
          onRules={() => setScreen('rules')}
          onHistory={() => setScreen('history')}
        />
      </SwipeBack>
    )
  }

  if (screen === 'play' && game) {
    return (
      <SwipeBack onBack={goHome}>
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
      </SwipeBack>
    )
  }

  return (
    <SwipeBack onBack={onLeaveGames}>
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
    </SwipeBack>
  )
}
