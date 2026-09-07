import { useCallback, useEffect, useRef, useState } from 'react'
import { advanceRound, createGame, setRoundScore } from './engine.ts'
import { gameHasProgress, listHistory, loadGame, recordToGame, saveGame, upsertHistory } from './persist.ts'
import type { Phase10Game, Phase10Record } from './types.ts'

function archiveGame(game: Phase10Game, archived: Set<string>, force = false): void {
  if (!force && archived.has(game.id)) {
    return
  }
  if (game.status === 'finished' || gameHasProgress(game)) {
    upsertHistory(game)
    archived.add(game.id)
  }
}

export function usePhase10Game() {
  const [game, setGame] = useState<Phase10Game | null>(() => loadGame())
  const [historyCount, setHistoryCount] = useState(() => listHistory().length)
  const archivedRef = useRef(new Set(listHistory().map((record) => record.id)))

  useEffect(() => {
    saveGame(game)
  }, [game])

  useEffect(() => {
    if (game?.status === 'finished') {
      archiveGame(game, archivedRef.current)
      setHistoryCount(listHistory().length)
    }
  }, [game])

  const refreshHistoryCount = useCallback(() => {
    setHistoryCount(listHistory().length)
  }, [])

  const stashCurrentGame = useCallback((current: Phase10Game | null) => {
    if (!current) {
      return
    }
    archiveGame(current, archivedRef.current, true)
    setHistoryCount(listHistory().length)
  }, [])

  const startGame = useCallback(
    (names: string[]) => {
      setGame((current) => {
        stashCurrentGame(current)
        return createGame(names)
      })
    },
    [stashCurrentGame],
  )

  const recordScore = useCallback((playerId: string, leftover: number | null, completed: boolean) => {
    setGame((current) => (current ? setRoundScore(current, playerId, leftover, completed) : current))
  }, [])

  const nextRound = useCallback(() => {
    setGame((current) => (current ? advanceRound(current) : current))
  }, [])

  const clearGame = useCallback(() => {
    setGame((current) => {
      stashCurrentGame(current)
      return null
    })
  }, [stashCurrentGame])

  const resumeFromHistory = useCallback(
    (record: Phase10Record) => {
      setGame((current) => {
        stashCurrentGame(current)
        archivedRef.current.delete(record.id)
        return recordToGame(record)
      })
    },
    [stashCurrentGame],
  )

  return {
    game,
    historyCount,
    refreshHistoryCount,
    startGame,
    recordScore,
    nextRound,
    clearGame,
    resumeFromHistory,
  }
}
