import { describe, expect, it } from 'vitest'
import {
  clampLeftover,
  createGame,
  lastPlacePlayers,
  playerTotal,
  recordHand,
  setRoundScore,
  winners,
} from './engine.ts'
import { GIN_BONUS, UNDERCUT_BONUS } from './rules.ts'

describe('Gin Rummy engine', () => {
  it('needs two to six named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–6/)
    expect(createGame(['Ryan', 'Ada']).winThreshold).toBe(100)
  })

  it('scores a knock as the leftover difference', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordHand(game, ryan!.id, { [ryan!.id]: 4, [ada!.id]: 18 }, false)
    expect(playerTotal(game, ryan!.id)).toBe(14)
    expect(playerTotal(game, ada!.id)).toBe(0)
  })

  it('adds the gin bonus on a going-out hand', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordHand(game, ryan!.id, { [ryan!.id]: 0, [ada!.id]: 12 }, true)
    expect(playerTotal(game, ryan!.id)).toBe(12 + GIN_BONUS)
    expect(playerTotal(game, ada!.id)).toBe(0)
  })

  it('awards an undercut to the defending player', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordHand(game, ryan!.id, { [ryan!.id]: 10, [ada!.id]: 6 }, false)
    expect(playerTotal(game, ryan!.id)).toBe(0)
    expect(playerTotal(game, ada!.id)).toBe(4 + UNDERCUT_BONUS)
  })

  it('ends the game at 100', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordHand(game, ryan!.id, { [ryan!.id]: 0, [ada!.id]: 50 }, true)
    expect(game.status).toBe('playing')
    game = recordHand(game, ryan!.id, { [ryan!.id]: 0, [ada!.id]: 30 }, true)
    expect(playerTotal(game, ryan!.id)).toBe(50 + GIN_BONUS + 30 + GIN_BONUS)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('keeps only one knocker', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setRoundScore(game, ryan!.id, 4, true, false)
    game = setRoundScore(game, ada!.id, 8, true, false)
    const current = game.rounds[0]!
    expect(current[ryan!.id]?.knocker).toBe(false)
    expect(current[ada!.id]?.knocker).toBe(true)
  })

  it('clamps leftover deadwood', () => {
    expect(clampLeftover(-2)).toBe(0)
    expect(clampLeftover(12.6)).toBe(13)
    expect(clampLeftover(140)).toBe(99)
  })
})
