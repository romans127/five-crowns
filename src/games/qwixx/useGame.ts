import { useCallback, useEffect, useRef, useState } from 'react'
import { createGame, finishGame, setPenalties, setRowCrosses } from './engine.ts'
import { gameHasProgress, listHistory, loadGame, recordToGame, saveGame, upsertHistory } from './persist.ts'
import type { QwixxGame, QwixxRecord, QwixxRowId } from './types.ts'

function archiveGame(game: QwixxGame, archived: Set<string>, force = false): void {
  if (!force && archived.has(game.id)) {
    return
  }
  if (game.status === 'finished' || gameHasProgress(game)) {
    upsertHistory(game)
    archived.add(game.id)
  }
}

export function useQwixxGame() {
  const [game, setGame] = useState<QwixxGame | null>(() => loadGame())
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

  const stashCurrentGame = useCallback((current: QwixxGame | null) => {
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

  const recordRow = useCallback((playerId: string, row: QwixxRowId, count: number) => {
    setGame((current) => (current ? setRowCrosses(current, playerId, row, count) : current))
  }, [])

  const recordPenalties = useCallback((playerId: string, count: number) => {
    setGame((current) => (current ? setPenalties(current, playerId, count) : current))
  }, [])

  const callGame = useCallback(() => {
    setGame((current) => (current ? finishGame(current) : current))
  }, [])

  const clearGame = useCallback(() => {
    setGame((current) => {
      stashCurrentGame(current)
      return null
    })
  }, [stashCurrentGame])

  const resumeFromHistory = useCallback(
    (record: QwixxRecord) => {
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
    recordRow,
    recordPenalties,
    callGame,
    clearGame,
    resumeFromHistory,
  }
}
