import { useEffect } from 'react'
import { History } from './components/History.tsx'
import { Home } from './components/Home.tsx'
import { Leaderboard } from './components/Leaderboard.tsx'
import { Play } from './components/Play.tsx'
import { Rules } from './components/Rules.tsx'
import { Setup } from './components/Setup.tsx'
import { Winner } from './components/Winner.tsx'
import { useDirectedScreen } from './hooks/useDirectedScreen.ts'
import { useGame } from './hooks/useGame.ts'
import { recordToGame } from './game/history.ts'
import { SceneStage } from './platform/SceneNav.tsx'
import { SwipeBack } from './platform/SwipeBack.tsx'
import type { Screen } from './game/types.ts'

type FiveCrownsAppProps = {
  onLeaveGames: () => void
}

function initialScreen(game: ReturnType<typeof useGame>['game']): Screen {
  if (!game) {
    return 'home'
  }
  return game.status === 'finished' ? 'winner' : 'play'
}

export function FiveCrownsApp({ onLeaveGames }: FiveCrownsAppProps) {
  const { game, historyCount, refreshHistoryCount, startGame, recordScore, nextHand, selectHand, clearGame, resumeFromHistory } =
    useGame()
  const { screen, transition, navigate, back } = useDirectedScreen<Screen>(initialScreen(game))

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
      <History
        onBack={() => {
          refreshHistoryCount()
          back('home')
        }}
        onLeaderboard={() => navigate('leaderboard')}
        onResume={(record) => {
          const restored = recordToGame(record)
          resumeFromHistory(record)
          refreshHistoryCount()
          navigate(restored.status === 'finished' ? 'winner' : 'play')
        }}
      />
    )
  } else if (screen === 'leaderboard') {
    content = (
      <SwipeBack onBack={goHome}>
        <Leaderboard onBack={goHome} />
      </SwipeBack>
    )
  } else if (screen === 'rules') {
    content = (
      <SwipeBack onBack={goRulesBack}>
        <Rules onBack={goRulesBack} backLabel={game ? 'Table' : 'Five Crowns'} />
      </SwipeBack>
    )
  } else if (screen === 'setup') {
    content = (
      <SwipeBack onBack={goHome}>
        <Setup
          onBack={goHome}
          onStart={(names) => {
            startGame(names)
            navigate('play')
          }}
        />
      </SwipeBack>
    )
  } else if (screen === 'winner' && game) {
    content = (
      <SwipeBack onBack={goWinnerHome}>
        <Winner
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
    if (game.status === 'finished') {
      content = (
        <SwipeBack onBack={goWinnerHome}>
          <Winner
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
    } else {
      content = (
        <SwipeBack onBack={goHome}>
          <Play
            game={game}
            onBack={goHome}
            onScore={recordScore}
            onNextHand={() => {
              nextHand()
              if (game.currentHand === 10) {
                navigate('winner')
              }
            }}
            onSelectHand={selectHand}
            onRules={() => navigate('rules')}
            onQuit={() => {
              clearGame()
              back('home')
            }}
          />
        </SwipeBack>
      )
    }
  } else {
    content = (
      <SwipeBack onBack={onLeaveGames}>
        <Home
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
