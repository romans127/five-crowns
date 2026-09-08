import { describe, expect, it } from 'vitest'
import {
  canCallGame,
  clampPoints,
  createGame,
  finishEarly,
  lastPlacePlayers,
  playerTotal,
  recordRound,
  winners,
} from './engine.ts'
import { QUEEN_SPADES } from './rules.ts'

describe('Hearts engine', () => {
  it('needs two to six named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–6/)
    expect(() => createGame(Array.from({ length: 7 }, (_, index) => `P${index}`))).toThrow(/2–6/)
    expect(createGame(['Ryan', 'Ada']).loseThreshold).toBe(100)
  })

  it('adds hearts and the Queen of Spades as the table entered them', () => {
    let game = createGame(['Ryan', 'Ada', 'Sam'])
    const [ryan, ada, sam] = game.players
    game = recordRound(game, { [ryan!.id]: 5, [ada!.id]: QUEEN_SPADES, [sam!.id]: 8 })
    expect(playerTotal(game, ryan!.id)).toBe(5)
    expect(playerTotal(game, ada!.id)).toBe(13)
    expect(playerTotal(game, sam!.id)).toBe(8)
    expect(game.status).toBe('playing')
  })

  it('lets the table enter a moon shot as 0 / 26', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: 0, [ada!.id]: 26 })
    expect(playerTotal(game, ryan!.id)).toBe(0)
    expect(playerTotal(game, ada!.id)).toBe(26)
  })

  it('ends when someone reaches 100 and crowns the lowest score', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: 26, [ada!.id]: 0 })
    game = recordRound(game, { [ryan!.id]: 26, [ada!.id]: 4 })
    game = recordRound(game, { [ryan!.id]: 26, [ada!.id]: 2 })
    game = recordRound(game, { [ryan!.id]: 26, [ada!.id]: 1 })
    expect(playerTotal(game, ryan!.id)).toBe(104)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ryan'])
  })

  it('still awards the lowest total if the table calls early', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, { [ryan!.id]: 16, [ada!.id]: 10 })
    expect(canCallGame(game)).toBe(true)
    game = finishEarly(game)
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('clamps a round to 0–26', () => {
    expect(clampPoints(-3)).toBe(0)
    expect(clampPoints(13.4)).toBe(13)
    expect(clampPoints(40)).toBe(26)
  })
})
