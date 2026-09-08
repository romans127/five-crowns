import { describe, expect, it } from 'vitest'
import {
  advanceRound,
  canCallGame,
  clampPoints,
  createGame,
  finishEarly,
  lastPlacePlayers,
  playerTotal,
  recordRound,
  roundComplete,
  setRoundScore,
  winners,
} from './engine.ts'

describe('Cribbage engine', () => {
  it('needs two to six named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–6/)
    expect(() => createGame(Array.from({ length: 7 }, (_, index) => `P${index}`))).toThrow(/2–6/)
    expect(createGame(['Ryan', 'Ada']).winThreshold).toBe(121)
  })

  it('adds pegged points from each hand', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: 16, [ada!.id]: 8 })
    expect(playerTotal(game, ryan!.id)).toBe(16)
    expect(playerTotal(game, ada!.id)).toBe(8)
    expect(game.currentRound).toBe(1)
    expect(game.status).toBe('playing')
  })

  it('does not advance until every player’s hand is in', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setRoundScore(game, ryan!.id, 12)
    expect(roundComplete(game)).toBe(false)
    game = setRoundScore(game, ada!.id, 6)
    expect(roundComplete(game)).toBe(true)
    game = advanceRound(game)
    expect(game.currentRound).toBe(1)
  })

  it('ends the game when a player reaches 121', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: 80, [ada!.id]: 40 })
    expect(game.status).toBe('playing')
    game = recordRound(game, { [ryan!.id]: 41, [ada!.id]: 10 })
    expect(playerTotal(game, ryan!.id)).toBe(121)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('picks the highest score if the table ends before 121', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: 24, [ada!.id]: 31 })
    expect(canCallGame(game)).toBe(true)
    game = finishEarly(game)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('clamps a hand to the 121 board', () => {
    expect(clampPoints(-4)).toBe(0)
    expect(clampPoints(16.4)).toBe(16)
    expect(clampPoints(200)).toBe(121)
  })
})
