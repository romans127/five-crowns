import { useEffect } from 'react'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SceneStage } from '../../platform/SceneNav.tsx'
import { useDirectedScreen } from '../../hooks/useDirectedScreen.ts'
import {
  QwixxHistory,
  QwixxHome,
  QwixxLeaderboard,
  QwixxPlay,
  QwixxRules,
  QwixxSetup,
  QwixxWinner,
} from './screens.tsx'
import { useQwixxGame } from './useGame.ts'
import type { QwixxScreen } from './types.ts'

type QwixxAppProps = {
  onLeaveGames: () => void
}

function initialScreen(game: ReturnType<typeof useQwixxGame>['game']): QwixxScreen {
  if (!game) {
    return 'home'
  }
  return game.status === 'finished' ? 'winner' : 'play'
}

export function QwixxApp({ onLeaveGames }: QwixxAppProps) {
  const {
    game,
    historyCount,
    refreshHistoryCount,
    startGame,
    recordRow,
    recordPenalties,
    callGame,
    clearGame,
    resumeFromHistory,
  } = useQwixxGame()
  const { screen, transition, navigate, back } = useDirectedScreen<QwixxScreen>(initialScreen(game))

  const goHome = () => back('home')
  const goRulesBack = () => {
    if (game) {
      back(game.status === 'finished' ? 'winner' : 'play')
      return
    }
    back('home')
  }
  const goWinnerHome = () => {
    clearGame()
    back('home')
  }

  useEffect(() => {
    if (screen === 'home') {
      refreshHistoryCount()
    }
  }, [screen, refreshHistoryCount])

  let content

  if (screen === 'history') {
    content = (
      <QwixxHistory
        onBack={() => back('home')}
        onLeaderboard={() => navigate('leaderboard')}
        onResume={(record) => {
          resumeFromHistory(record)
          navigate(record.status === 'finished' ? 'winner' : 'play')
        }}
      />
    )
  } else if (screen === 'leaderboard') {
    content = (
      <SwipeBack onBack={goHome}>
        <QwixxLeaderboard onBack={goHome} />
      </SwipeBack>
    )
  } else if (screen === 'rules') {
    content = (
      <SwipeBack onBack={goRulesBack}>
        <QwixxRules onBack={goRulesBack} backLabel={game ? 'Table' : 'Qwixx'} />
      </SwipeBack>
    )
  } else if (screen === 'setup') {
    content = (
      <SwipeBack onBack={goHome}>
        <QwixxSetup
          onBack={goHome}
          onStart={(names) => {
            startGame(names)
            navigate('play')
          }}
        />
      </SwipeBack>
    )
  } else if ((screen === 'winner' || (screen === 'play' && game?.status === 'finished')) && game) {
    content = (
      <SwipeBack onBack={goWinnerHome}>
        <QwixxWinner
          game={game}
          onBack={goWinnerHome}
          onHome={goWinnerHome}
          onPlayAgain={(names) => {
            startGame(names)
            navigate('play')
          }}
          onRules={() => navigate('rules')}
          onHistory={() => navigate('history')}
        />
      </SwipeBack>
    )
  } else if (screen === 'play' && game) {
    content = (
      <SwipeBack onBack={goHome}>
        <QwixxPlay
          game={game}
          onBack={goHome}
          onRow={recordRow}
          onPenalties={recordPenalties}
          onCallGame={callGame}
          onRules={() => navigate('rules')}
          onQuit={() => {
            clearGame()
            back('home')
          }}
        />
      </SwipeBack>
    )
  } else {
    content = (
      <SwipeBack onBack={onLeaveGames}>
        <QwixxHome
          canResume={Boolean(game)}
          historyCount={historyCount}
          onLeaveGames={onLeaveGames}
          onNewGame={() => navigate('setup')}
          onResume={() => navigate(game?.status === 'finished' ? 'winner' : 'play')}
          onHistory={() => navigate('history')}
          onLeaderboard={() => navigate('leaderboard')}
          onRules={() => navigate('rules')}
        />
      </SwipeBack>
    )
  }

  return (
    <SceneStage sceneKey={screen} transition={transition}>
      {content}
    </SceneStage>
  )
}
