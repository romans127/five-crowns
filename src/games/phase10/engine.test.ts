import { describe, expect, it } from 'vitest'
import { advanceRound, createGame, playerTotal, setRoundScore, winners } from './engine.ts'

describe('Phase 10 engine', () => {
  it('starts players on phase 1 and scores leftovers', () => {
    let game = createGame(['Ryan', 'Ada'])
    expect(game.players.map((player) => player.phase)).toEqual([1, 1])
    game = setRoundScore(game, game.players[0]!.id, 15, true)
    game = setRoundScore(game, game.players[1]!.id, 25, false)
    game = advanceRound(game)
    expect(game.players[0]?.phase).toBe(2)
    expect(game.players[1]?.phase).toBe(1)
    expect(playerTotal(game, game.players[0]!.id)).toBe(15)
    expect(game.currentRound).toBe(1)
  })

  it('ends the game when someone completes phase 10', () => {
    let game = createGame(['Ryan', 'Ada'])
    game = {
      ...game,
      players: game.players.map((player, index) => ({ ...player, phase: index === 0 ? 10 : 8 })),
    }
    game = setRoundScore(game, game.players[0]!.id, 5, true)
    game = setRoundScore(game, game.players[1]!.id, 40, false)
    game = advanceRound(game)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
  })
})
