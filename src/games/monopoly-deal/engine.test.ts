import { describe, expect, it } from 'vitest'
import {
  canCallGame,
  clampPoints,
  clampSets,
  createGame,
  finishGame,
  lastPlacePlayers,
  playerSets,
  setPlayerScore,
  standings,
  winners,
  wouldFinish,
} from './engine.ts'

describe('Monopoly Deal engine', () => {
  it('needs two to five named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–5/)
    expect(() => createGame(Array.from({ length: 6 }, (_, index) => `P${index}`))).toThrow(/2–5/)
    expect(createGame(['Ryan', 'Ada']).winThreshold).toBe(3)
  })

  it('tracks complete property sets and optional cash points', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPlayerScore(game, ryan!.id, 2, 12)
    game = setPlayerScore(game, ada!.id, 1, 40)
    expect(playerSets(game, ryan!.id)).toBe(2)
    expect(standings(game)[0]?.player.name).toBe('Ryan')
    expect(wouldFinish(game)).toBe(false)
  })

  it('ends when a player completes three sets', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPlayerScore(game, ryan!.id, 3, 8)
    game = setPlayerScore(game, ada!.id, 1, 55)
    expect(wouldFinish(game)).toBe(true)
    game = finishGame(game)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('breaks an early call with most sets, then optional points', () => {
    let game = createGame(['Ryan', 'Ada', 'Sam'])
    const [ryan, ada, sam] = game.players
    game = setPlayerScore(game, ryan!.id, 2, 10)
    game = setPlayerScore(game, ada!.id, 2, 30)
    game = setPlayerScore(game, sam!.id, 1, 80)
    expect(canCallGame(game)).toBe(true)
    game = finishGame(game)
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('clamps sets and cash to a house-friendly range', () => {
    expect(clampSets(-1)).toBe(0)
    expect(clampSets(2.6)).toBe(3)
    expect(clampSets(20)).toBe(8)
    expect(clampPoints(-4)).toBe(0)
    expect(clampPoints(2000)).toBe(999)
  })
})
