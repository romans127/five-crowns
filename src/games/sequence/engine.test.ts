import { describe, expect, it } from 'vitest'
import {
  canCallGame,
  clampSequences,
  createGame,
  finishGame,
  lastPlacePlayers,
  playerSequences,
  sequencesNeeded,
  setSequences,
  winners,
  wouldFinish,
} from './engine.ts'

describe('Sequence engine', () => {
  it('needs two to six named players or teams', () => {
    expect(() => createGame(['Ryan'])).toThrow(/2–6/)
    expect(() => createGame(Array.from({ length: 7 }, (_, index) => `P${index}`))).toThrow(/2–6/)
  })

  it('needs two sequences for 3–6 players and one for teams or two players', () => {
    expect(sequencesNeeded(4, 'open')).toBe(2)
    expect(sequencesNeeded(2, 'open')).toBe(1)
    expect(sequencesNeeded(4, 'teams')).toBe(1)
    expect(createGame(['Ryan', 'Ada', 'Sam']).winThreshold).toBe(2)
    expect(createGame(['Ryan', 'Ada'], 'teams').winThreshold).toBe(1)
  })

  it('ends when a player or team reaches the needed sequences', () => {
    let game = createGame(['Ryan', 'Ada', 'Sam'])
    const [ryan, ada, sam] = game.players
    game = setSequences(game, ryan!.id, 2)
    game = setSequences(game, ada!.id, 1)
    game = setSequences(game, sam!.id, 0)
    expect(playerSequences(game, ryan!.id)).toBe(2)
    expect(wouldFinish(game)).toBe(true)
    game = finishGame(game)
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
    expect(lastPlacePlayers(game).map((player) => player.name)).toEqual(['Sam'])
  })

  it('picks the most sequences if the table calls early', () => {
    let game = createGame(['Ryan', 'Ada'], 'teams')
    const [ryan, ada] = game.players
    game = setSequences(game, ryan!.id, 0)
    game = setSequences(game, ada!.id, 1)
    expect(canCallGame(game)).toBe(true)
    game = finishGame(game)
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('clamps sequences to a house-friendly range', () => {
    expect(clampSequences(-1)).toBe(0)
    expect(clampSequences(2.2)).toBe(2)
    expect(clampSequences(9)).toBe(5)
  })
})
