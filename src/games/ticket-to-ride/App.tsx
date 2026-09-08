import { useEffect } from 'react'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SceneStage } from '../../platform/SceneNav.tsx'
import { useDirectedScreen } from '../../hooks/useDirectedScreen.ts'
import {
  TtrHistory,
  TtrHome,
  TtrLeaderboard,
  TtrPlay,
  TtrRules,
  TtrSetup,
  TtrWinner,
} from './screens.tsx'
import { useTtrGame } from './useGame.ts'
import type { TtrScreen } from './types.ts'

type TtrAppProps = {
  onLeaveGames: () => void
}

function initialScreen(game: ReturnType<typeof useTtrGame>['game']): TtrScreen {
  if (!game) {
    return 'home'
  }
  return game.status === 'finished' ? 'winner' : 'play'
}

export function TtrApp({ onLeaveGames }: TtrAppProps) {
  const {
    game,
    historyCount,
    refreshHistoryCount,
    startGame,
    recordScore,
    crownWinner,
    clearGame,
    resumeFromHistory,
  } = useTtrGame()
  const { screen, transition, navigate, back } = useDirectedScreen<TtrScreen>(initialScreen(game))

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
      <TtrHistory
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
        <TtrLeaderboard onBack={goHome} />
      </SwipeBack>
    )
  } else if (screen === 'rules') {
    content = (
      <SwipeBack onBack={goRulesBack}>
        <TtrRules onBack={goRulesBack} backLabel={game ? 'Table' : 'Ticket to Ride'} />
      </SwipeBack>
    )
  } else if (screen === 'setup') {
    content = (
      <SwipeBack onBack={goHome}>
        <TtrSetup
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
        <TtrWinner
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
        <TtrPlay
          game={game}
          onBack={goHome}
          onScore={recordScore}
          onFinish={crownWinner}
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
        <TtrHome
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
