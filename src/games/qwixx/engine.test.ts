import { describe, expect, it } from 'vitest'
import {
  createGame,
  lastPlacePlayers,
  lockedRows,
  playerTotal,
  setPenalties,
  setRowCrosses,
  wouldFinish,
  winners,
} from './engine.ts'
import { triangleScore } from './rules.ts'

describe('Qwixx engine', () => {
  it('needs two to five named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–5/)
    expect(createGame(['Ryan', 'Ada']).players).toHaveLength(2)
  })

  it('scores colored rows as triangular numbers and penalties at −5', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan] = game.players
    game = setRowCrosses(game, ryan!.id, 'red', 4)
    game = setRowCrosses(game, ryan!.id, 'yellow', 3)
    game = setPenalties(game, ryan!.id, 2)
    const player = game.players.find((entry) => entry.id === ryan!.id)!
    expect(triangleScore(4)).toBe(10)
    expect(playerTotal(player)).toBe(10 + 6 - 10)
  })

  it('treats five or more crosses as a locked row and ends after two lockouts', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan] = game.players
    game = setRowCrosses(game, ryan!.id, 'red', 5)
    game = setRowCrosses(game, ryan!.id, 'blue', 6)
    const player = game.players.find((entry) => entry.id === ryan!.id)!
    expect(lockedRows(player.pad)).toBe(2)
    expect(wouldFinish(game)).toBe(true)
  })

  it('awards the highest pad when the table is done', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setRowCrosses(game, ryan!.id, 'red', 8)
    game = setRowCrosses(game, ada!.id, 'green', 2)
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })
})
