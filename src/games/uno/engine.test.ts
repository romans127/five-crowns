import { describe, expect, it } from 'vitest'
import {
  advanceRound,
  canCallGame,
  clampLeftover,
  createGame,
  finishEarly,
  lastPlacePlayers,
  playerTotal,
  recordRound,
  roundComplete,
  setRoundScore,
  standings,
  winners,
} from './engine.ts'
import { ACTION_POINTS, WILD_POINTS } from './rules.ts'

describe('Uno engine', () => {
  it('needs two to ten named players', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–10/)
    expect(() => createGame(Array.from({ length: 11 }, (_, index) => `P${index}`))).toThrow(/2–10/)
    expect(createGame(['Ryan', 'Ada']).winThreshold).toBe(500)
  })

  it('awards leftover card points to the player who went out', () => {
    let game = createGame(['Ryan', 'Ada', 'Sam'])
    const [ryan, ada, sam] = game.players
    const leftover =
      8 + 5 + ACTION_POINTS + WILD_POINTS
    game = recordRound(game, ryan!.id, { [ada!.id]: leftover, [sam!.id]: 12 })

    expect(playerTotal(game, ryan!.id)).toBe(leftover + 12)
    expect(playerTotal(game, ada!.id)).toBe(0)
    expect(playerTotal(game, sam!.id)).toBe(0)
    expect(game.currentRound).toBe(1)
    expect(game.status).toBe('playing')
    expect(standings(game).map((row) => row.player.name)).toEqual(['Ryan', 'Ada', 'Sam'])
  })

  it('does not advance until someone went out and every leftover is in', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setRoundScore(game, ada!.id, 20, false)
    expect(roundComplete(game)).toBe(false)
    game = setRoundScore(game, ryan!.id, 0, true)
    expect(roundComplete(game)).toBe(true)
    game = advanceRound(game)
    expect(playerTotal(game, ryan!.id)).toBe(20)
    expect(game.currentRound).toBe(1)
  })

  it('keeps only one player marked as gone out', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setRoundScore(game, ryan!.id, 0, true)
    game = setRoundScore(game, ada!.id, 0, true)
    const current = game.rounds[0]!
    expect(current[ryan!.id]?.wentOut).toBe(false)
    expect(current[ada!.id]?.wentOut).toBe(true)
    expect(current[ada!.id]?.leftover).toBe(0)
  })

  it('ends the game when a player reaches 500', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = recordRound(game, ryan!.id, { [ada!.id]: 260 })
    expect(game.status).toBe('playing')
    game = recordRound(game, ryan!.id, { [ada!.id]: 250 })
    expect(playerTotal(game, ryan!.id)).toBe(510)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('picks the highest score if the table ends before 500', () => {
    let game = createGame(['Ryan', 'Ada', 'Sam'])
    const [ryan, ada, sam] = game.players
    game = recordRound(game, ada!.id, { [ryan!.id]: 40, [sam!.id]: 15 })
    expect(canCallGame(game)).toBe(true)
    game = finishEarly(game)
    expect(game.status).toBe('finished')
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
    expect(standings(game)[0]?.total).toBe(55)
  })

  it('clamps leftover points to a house-friendly range', () => {
    expect(clampLeftover(-12)).toBe(0)
    expect(clampLeftover(40.6)).toBe(41)
    expect(clampLeftover(2000)).toBe(999)
  })
})
