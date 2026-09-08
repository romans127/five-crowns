import { useEffect } from 'react'
import { SwipeBack } from '../../platform/SwipeBack.tsx'
import { SceneStage } from '../../platform/SceneNav.tsx'
import { useDirectedScreen } from '../../hooks/useDirectedScreen.ts'
import {
  YahtzeeHistory,
  YahtzeeHome,
  YahtzeeLeaderboard,
  YahtzeePlay,
  YahtzeeRules,
  YahtzeeSetup,
  YahtzeeWinner,
} from './screens.tsx'
import { useYahtzeeGame } from './useGame.ts'
import type { YahtzeeScreen } from './types.ts'

type YahtzeeAppProps = {
  onLeaveGames: () => void
}

function initialScreen(game: ReturnType<typeof useYahtzeeGame>['game']): YahtzeeScreen {
  if (!game) {
    return 'home'
  }
  return game.status === 'finished' ? 'winner' : 'play'
}

export function YahtzeeApp({ onLeaveGames }: YahtzeeAppProps) {
  const { game, historyCount, refreshHistoryCount, startGame, recordScore, recordBonuses, clearGame, resumeFromHistory } =
    useYahtzeeGame()
  const { screen, transition, navigate, back } = useDirectedScreen<YahtzeeScreen>(initialScreen(game))

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
      <YahtzeeHistory
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
        <YahtzeeLeaderboard onBack={goHome} />
      </SwipeBack>
    )
  } else if (screen === 'rules') {
    content = (
      <SwipeBack onBack={goRulesBack}>
        <YahtzeeRules onBack={goRulesBack} backLabel={game ? 'Table' : 'Yahtzee'} />
      </SwipeBack>
    )
  } else if (screen === 'setup') {
    content = (
      <SwipeBack onBack={goHome}>
        <YahtzeeSetup
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
        <YahtzeeWinner
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
        <YahtzeePlay
          game={game}
          onBack={goHome}
          onScore={recordScore}
          onBonuses={recordBonuses}
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
        <YahtzeeHome
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
