import { describe, expect, it } from 'vitest'
import {
  boxesFilled,
  createGame,
  playerTotals,
  setCategoryScore,
  setYahtzeeBonuses,
  standings,
  winners,
} from './engine.ts'
import { UPPER_BONUS, YAHTZEE_BONUS, YAHTZEE_SCORE } from './rules.ts'
import type { CategoryId, YahtzeeGame } from './types.ts'

const ALL_BOXES: CategoryId[] = [
  'aces',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
  'threeKind',
  'fourKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yahtzee',
  'chance',
]

function fillCard(game: YahtzeeGame, playerId: string, scores: Partial<Record<CategoryId, number>>): YahtzeeGame {
  return ALL_BOXES.reduce((current, category) => {
    const value = scores[category]
    return setCategoryScore(current, playerId, category, value ?? 0)
  }, game)
}

describe('Yahtzee engine', () => {
  it('starts with 13 empty boxes and no upper bonus', () => {
    const game = createGame(['Ryan', 'Ada'])
    expect(game.players).toHaveLength(2)
    expect(boxesFilled(game.players[0]!)).toBe(0)
    expect(playerTotals(game.players[0]!).upperBonus).toBe(0)
    expect(playerTotals(game.players[0]!).grandTotal).toBe(0)
  })

  it('awards the 35-point upper bonus at 63 and not at 62', () => {
    let game = createGame(['Ryan', 'Ada'])
    const ryan = game.players[0]!.id
    game = setCategoryScore(game, ryan, 'aces', 3)
    game = setCategoryScore(game, ryan, 'twos', 6)
    game = setCategoryScore(game, ryan, 'threes', 9)
    game = setCategoryScore(game, ryan, 'fours', 12)
    game = setCategoryScore(game, ryan, 'fives', 15)
    game = setCategoryScore(game, ryan, 'sixes', 17)
    expect(playerTotals(game.players[0]!).upperSubtotal).toBe(62)
    expect(playerTotals(game.players[0]!).upperBonus).toBe(0)

    game = setCategoryScore(game, ryan, 'sixes', 18)
    const totals = playerTotals(game.players[0]!)
    expect(totals.upperSubtotal).toBe(63)
    expect(totals.upperBonus).toBe(UPPER_BONUS)
    expect(totals.upperTotal).toBe(98)
  })

  it('scores the first Yahtzee as 50 and extra Yahtzees as +100 bonuses', () => {
    let game = createGame(['Ryan', 'Ada'])
    const ryan = game.players[0]!.id
    game = setCategoryScore(game, ryan, 'yahtzee', YAHTZEE_SCORE)
    expect(playerTotals(game.players[0]!).grandTotal).toBe(YAHTZEE_SCORE)

    game = setYahtzeeBonuses(game, ryan, 2)
    expect(playerTotals(game.players[0]!).yahtzeeBonusPoints).toBe(2 * YAHTZEE_BONUS)
    expect(playerTotals(game.players[0]!).grandTotal).toBe(YAHTZEE_SCORE + 2 * YAHTZEE_BONUS)
  })

  it('clears Yahtzee bonuses if the Yahtzee box is scratched', () => {
    let game = createGame(['Ryan', 'Ada'])
    const ryan = game.players[0]!.id
    game = setCategoryScore(game, ryan, 'yahtzee', YAHTZEE_SCORE)
    game = setYahtzeeBonuses(game, ryan, 1)
    game = setCategoryScore(game, ryan, 'yahtzee', 0)
    expect(game.players[0]!.yahtzeeBonuses).toBe(0)
    expect(playerTotals(game.players[0]!).grandTotal).toBe(0)
  })

  it('ranks standings by highest grand total and crowns that winner', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = fillCard(game, ryan!.id, {
      aces: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      threeKind: 20,
      fourKind: 22,
      fullHouse: 25,
      smallStraight: 30,
      largeStraight: 40,
      yahtzee: 50,
      chance: 20,
    })
    game = fillCard(game, ada!.id, {
      aces: 1,
      chance: 10,
    })

    expect(game.status).toBe('finished')
    const ranked = standings(game)
    expect(ranked[0]?.player.name).toBe('Ryan')
    expect(ranked[0]?.total).toBe(305)
    expect(winners(game).map((player) => player.name)).toEqual(['Ryan'])
  })

  it('clamps fixed categories to the official score or zero', () => {
    let game = createGame(['Ryan', 'Ada'])
    const ryan = game.players[0]!.id
    game = setCategoryScore(game, ryan, 'fullHouse', 12)
    expect(game.players[0]!.scores.fullHouse).toBe(25)
    game = setCategoryScore(game, ryan, 'fullHouse', 0)
    expect(game.players[0]!.scores.fullHouse).toBe(0)
  })
})
