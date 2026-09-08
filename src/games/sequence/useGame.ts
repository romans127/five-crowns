import { useCallback, useEffect, useRef, useState } from 'react'
import { createGame, finishGame, setSequences } from './engine.ts'
import { gameHasProgress, listHistory, loadGame, recordToGame, saveGame, upsertHistory } from './persist.ts'
import type { SequenceGame, SequenceMode, SequenceRecord } from './types.ts'

function archiveGame(game: SequenceGame, archived: Set<string>, force = false): void {
  if (!force && archived.has(game.id)) {
    return
  }
  if (game.status === 'finished' || gameHasProgress(game)) {
    upsertHistory(game)
    archived.add(game.id)
  }
}

export function useSequenceGame() {
  const [game, setGame] = useState<SequenceGame | null>(() => loadGame())
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

  const stashCurrentGame = useCallback((current: SequenceGame | null) => {
    if (!current) {
      return
    }
    archiveGame(current, archivedRef.current, true)
    setHistoryCount(listHistory().length)
  }, [])

  const startGame = useCallback(
    (names: string[], mode: SequenceMode = 'open') => {
      setGame((current) => {
        stashCurrentGame(current)
        return createGame(names, mode)
      })
    },
    [stashCurrentGame],
  )

  const recordScore = useCallback((playerId: string, sequences: number | null) => {
    setGame((current) => (current ? setSequences(current, playerId, sequences) : current))
  }, [])

  const crownWinner = useCallback(() => {
    setGame((current) => (current ? finishGame(current) : current))
  }, [])

  const clearGame = useCallback(() => {
    setGame((current) => {
      stashCurrentGame(current)
      return null
    })
  }, [stashCurrentGame])

  const resumeFromHistory = useCallback(
    (record: SequenceRecord) => {
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
    crownWinner,
    clearGame,
    resumeFromHistory,
  }
}
