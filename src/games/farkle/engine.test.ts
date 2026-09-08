import { describe, expect, it } from 'vitest'
import {
  clampPoints,
  createGame,
  lastPlacePlayers,
  playerTotal,
  recordRound,
  winners,
} from './engine.ts'

describe('Farkle engine', () => {
  it('needs two to eight named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–8/)
    expect(createGame(['Ryan', 'Ada']).winThreshold).toBe(10000)
  })

  it('banks points and treats a farkle as zero', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, {
      [ryan!.id]: { points: 400 },
      [ada!.id]: { points: 250, farkle: true },
    })
    expect(playerTotal(game, ryan!.id)).toBe(400)
    expect(playerTotal(game, ada!.id)).toBe(0)
    expect(game.currentRound).toBe(1)
  })

  it('ends the game at 10,000', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: { points: 6000 }, [ada!.id]: { points: 800 } })
    expect(game.status).toBe('playing')
    game = recordRound(game, { [ryan!.id]: { points: 4000 }, [ada!.id]: { points: 200 } })
    expect(playerTotal(game, ryan!.id)).toBe(10000)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('clamps a turn to the 10,000 board', () => {
    expect(clampPoints(-50)).toBe(0)
    expect(clampPoints(350.4)).toBe(350)
    expect(clampPoints(20000)).toBe(10000)
  })
})
