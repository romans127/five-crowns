import { useEffect } from 'react'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SceneStage } from '../../platform/SceneNav.tsx'
import { useDirectedScreen } from '../../hooks/useDirectedScreen.ts'
import {
  CribbageHistory,
  CribbageHome,
  CribbageLeaderboard,
  CribbagePlay,
  CribbageRules,
  CribbageSetup,
  CribbageWinner,
} from './screens.tsx'
import { useCribbageGame } from './useGame.ts'
import type { CribbageScreen } from './types.ts'

type CribbageAppProps = {
  onLeaveGames: () => void
}

function initialScreen(game: ReturnType<typeof useCribbageGame>['game']): CribbageScreen {
  if (!game) {
    return 'home'
  }
  return game.status === 'finished' ? 'winner' : 'play'
}

export function CribbageApp({ onLeaveGames }: CribbageAppProps) {
  const {
    game,
    historyCount,
    refreshHistoryCount,
    startGame,
    recordScore,
    nextRound,
    callGame,
    clearGame,
    resumeFromHistory,
  } = useCribbageGame()
  const { screen, transition, navigate, back } = useDirectedScreen<CribbageScreen>(initialScreen(game))

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
      <CribbageHistory
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
        <CribbageLeaderboard onBack={goHome} />
      </SwipeBack>
    )
  } else if (screen === 'rules') {
    content = (
      <SwipeBack onBack={goRulesBack}>
        <CribbageRules onBack={goRulesBack} backLabel={game ? 'Table' : 'Cribbage'} />
      </SwipeBack>
    )
  } else if (screen === 'setup') {
    content = (
      <SwipeBack onBack={goHome}>
        <CribbageSetup
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
        <CribbageWinner
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
        <CribbagePlay
          game={game}
          onBack={goHome}
          onScore={recordScore}
          onNextRound={() => {
            nextRound()
          }}
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
        <CribbageHome
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
