import { describe, expect, it } from 'vitest'
import {
  canCallGame,
  clampPawns,
  createGame,
  finishGame,
  lastPlacePlayers,
  playerPawns,
  setPawnsHome,
  winners,
  wouldFinish,
} from './engine.ts'

describe('Sorry engine', () => {
  it('needs two to four named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–4/)
    expect(() => createGame(['A', 'B', 'C', 'D', 'E'])).toThrow(/2–4/)
    expect(createGame(['Ryan', 'Ada']).winThreshold).toBe(4)
  })

  it('tracks pawns home from 0 to 4', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPawnsHome(game, ryan!.id, 2)
    game = setPawnsHome(game, ada!.id, 1)
    expect(playerPawns(game, ryan!.id)).toBe(2)
    expect(wouldFinish(game)).toBe(false)
  })

  it('ends when a player gets all four pawns home', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPawnsHome(game, ryan!.id, 4)
    game = setPawnsHome(game, ada!.id, 2)
    expect(wouldFinish(game)).toBe(true)
    game = finishGame(game)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('picks the most pawns home if the table calls early', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setPawnsHome(game, ryan!.id, 3)
    game = setPawnsHome(game, ada!.id, 1)
    expect(canCallGame(game)).toBe(true)
    game = finishGame(game)
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
  })

  it('clamps pawns to the four on the board', () => {
    expect(clampPawns(-2)).toBe(0)
    expect(clampPawns(2.4)).toBe(2)
    expect(clampPawns(9)).toBe(4)
  })
})
