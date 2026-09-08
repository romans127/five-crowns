import { useCallback, useEffect, useRef, useState } from 'react'
import { advanceRound, createGame, finishEarly, setRoundScore } from './engine.ts'
import { gameHasProgress, listHistory, loadGame, recordToGame, saveGame, upsertHistory } from './persist.ts'
import type { GinGame, GinRecord } from './types.ts'

function archiveGame(game: GinGame, archived: Set<string>, force = false): void {
  if (!force && archived.has(game.id)) {
    return
  }
  if (game.status === 'finished' || gameHasProgress(game)) {
    upsertHistory(game)
    archived.add(game.id)
  }
}

export function useGinGame() {
  const [game, setGame] = useState<GinGame | null>(() => loadGame())
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

  const stashCurrentGame = useCallback((current: GinGame | null) => {
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

  const recordScore = useCallback((playerId: string, leftover: number | null, knocker: boolean, gin: boolean) => {
    setGame((current) => (current ? setRoundScore(current, playerId, leftover, knocker, gin) : current))
  }, [])

  const nextRound = useCallback(() => {
    setGame((current) => (current ? advanceRound(current) : current))
  }, [])

  const callGame = useCallback(() => {
    setGame((current) => (current ? finishEarly(current) : current))
  }, [])

  const clearGame = useCallback(() => {
    setGame((current) => {
      stashCurrentGame(current)
      return null
    })
  }, [stashCurrentGame])

  const resumeFromHistory = useCallback(
    (record: GinRecord) => {
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
    callGame,
    clearGame,
    resumeFromHistory,
  }
}
