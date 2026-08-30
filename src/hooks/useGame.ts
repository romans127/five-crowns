import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { advanceHand, createGame, goToHand, setHandScore } from '../game/engine.ts'
import { gameHasProgress, listHistory, upsertHistory } from '../game/history.ts'
import { loadGame, saveGame } from '../game/storage.ts'
import type { Game } from '../game/types.ts'

function archiveGame(game: Game, archived: Set<string>): void {
  if (archived.has(game.id)) {
    return
  }
  if (game.status === 'finished' || gameHasProgress(game)) {
    upsertHistory(game)
    archived.add(game.id)
  }
}

export function useGame() {
  const [game, setGame] = useState<Game | null>(() => loadGame())
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

  const stashCurrentGame = useCallback((current: Game | null) => {
    if (!current) {
      return
    }
    archiveGame(current, archivedRef.current)
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

  const recordScore = useCallback((handIndex: number, playerId: string, score: number | null) => {
    setGame((current) => (current ? setHandScore(current, handIndex, playerId, score) : current))
  }, [])

  const nextHand = useCallback(() => {
    setGame((current) => (current ? advanceHand(current) : current))
  }, [])

  const selectHand = useCallback((handIndex: number) => {
    setGame((current) => (current ? goToHand(current, handIndex) : current))
  }, [])

  const clearGame = useCallback(() => {
    setGame((current) => {
      stashCurrentGame(current)
      return null
    })
  }, [stashCurrentGame])

  const hasSavedGame = useMemo(() => game !== null, [game])

  return {
    game,
    hasSavedGame,
    historyCount,
    refreshHistoryCount,
    startGame,
    recordScore,
    nextHand,
    selectHand,
    clearGame,
  }
}
