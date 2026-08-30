import { useCallback, useEffect, useMemo, useState } from 'react'
import { advanceHand, createGame, goToHand, setHandScore } from '../game/engine.ts'
import { loadGame, saveGame } from '../game/storage.ts'
import type { Game } from '../game/types.ts'

export function useGame() {
  const [game, setGame] = useState<Game | null>(() => loadGame())

  useEffect(() => {
    saveGame(game)
  }, [game])

  const startGame = useCallback((names: string[]) => {
    setGame(createGame(names))
  }, [])

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
    setGame(null)
  }, [])

  const hasSavedGame = useMemo(() => game !== null, [game])

  return {
    game,
    hasSavedGame,
    startGame,
    recordScore,
    nextHand,
    selectHand,
    clearGame,
  }
}
