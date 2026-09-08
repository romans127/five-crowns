import { describe, expect, it } from 'vitest'
import {
  canCallGame,
  clampTickets,
  createGame,
  finishGame,
  lastPlacePlayers,
  playerTotal,
  setPlayerScore,
  winners,
  wouldFinish,
} from './engine.ts'

describe('Ticket to Ride engine', () => {
  it('needs two to five named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–5/)
    expect(() => createGame(Array.from({ length: 6 }, (_, index) => `P${index}`))).toThrow(/2–5/)
    expect(createGame(['Ryan', 'Ada']).players).toHaveLength(2)
  })

  it('adds routes, net tickets, and the longest-route bonus', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPlayerScore(game, ryan!.id, 40, 12, 10)
    game = setPlayerScore(game, ada!.id, 36, -8, 0)
    expect(playerTotal(game, ryan!.id)).toBe(62)
    expect(playerTotal(game, ada!.id)).toBe(28)
    expect(wouldFinish(game)).toBe(true)
  })

  it('lets failed tickets subtract from the total', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan] = game.players
    game = setPlayerScore(game, ryan!.id, 20, -15, 0)
    expect(playerTotal(game, ryan!.id)).toBe(5)
    expect(clampTickets(-200)).toBe(-120)
    expect(clampTickets(200)).toBe(120)
  })

  it('crowns the highest total and can be called once one pad is complete', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPlayerScore(game, ryan!.id, 50, 8, 10)
    expect(canCallGame(game)).toBe(true)
    expect(wouldFinish(game)).toBe(false)
    game = setPlayerScore(game, ada!.id, 22, 4, 0)
    game = finishGame(game)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })
})
