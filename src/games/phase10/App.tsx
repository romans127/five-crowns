import { useEffect } from 'react'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SceneStage } from '../../platform/SceneNav.tsx'
import { useDirectedScreen } from '../../hooks/useDirectedScreen.ts'
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

function initialScreen(game: ReturnType<typeof usePhase10Game>['game']): Phase10Screen {
  if (!game) {
    return 'home'
  }
  return game.status === 'finished' ? 'winner' : 'play'
}

export function Phase10App({ onLeaveGames }: Phase10AppProps) {
  const { game, historyCount, refreshHistoryCount, startGame, recordScore, nextRound, clearGame, resumeFromHistory } =
    usePhase10Game()
  const { screen, transition, navigate, back } = useDirectedScreen<Phase10Screen>(initialScreen(game))

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
      <Phase10History
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
        <Phase10Leaderboard onBack={goHome} />
      </SwipeBack>
    )
  } else if (screen === 'rules') {
    content = (
      <SwipeBack onBack={goRulesBack}>
        <Phase10Rules onBack={goRulesBack} backLabel={game ? 'Table' : 'Phase 10'} />
      </SwipeBack>
    )
  } else if (screen === 'setup') {
    content = (
      <SwipeBack onBack={goHome}>
        <Phase10Setup
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
        <Phase10Winner
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
        <Phase10Play
          game={game}
          onBack={goHome}
          onScore={recordScore}
          onNextRound={() => {
            nextRound()
          }}
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
        <Phase10Home
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
