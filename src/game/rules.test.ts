import { describe, expect, it } from 'vitest'
import { HAND_SIZES } from './types.ts'
import {
  JOKER_POINTS,
  WILD_POINTS,
  cardsDealt,
  leftoverPoints,
  rankLabel,
  tallyLeftovers,
  wildLabel,
  wildRank,
} from './rules.ts'

describe('Five Crowns hands and wilds', () => {
  it('has eleven hands from 3 cards to Kings wild', () => {
    expect(HAND_SIZES).toHaveLength(11)
    expect(cardsDealt(0)).toBe(3)
    expect(cardsDealt(10)).toBe(13)
    expect(wildRank(0)).toBe(3)
    expect(wildRank(10)).toBe(13)
    expect(wildLabel(0)).toBe('3s')
    expect(wildLabel(8)).toBe('Jacks')
    expect(wildLabel(9)).toBe('Queens')
    expect(wildLabel(10)).toBe('Kings')
  })

  it('labels face cards the way a table calls them', () => {
    expect(rankLabel(7)).toBe('7')
    expect(rankLabel(11)).toBe('J')
    expect(rankLabel(12)).toBe('Q')
    expect(rankLabel(13)).toBe('K')
  })

  it('rejects a hand that does not exist', () => {
    expect(() => cardsDealt(11)).toThrow(/11 hands/)
  })
})

describe('leftover scoring', () => {
  it('scores face value unless the rank is the current wild', () => {
    expect(leftoverPoints({ type: 'rank', rank: 8 }, 5)).toBe(8)
    expect(leftoverPoints({ type: 'rank', rank: 11 }, 5)).toBe(11)
    expect(leftoverPoints({ type: 'rank', rank: 13 }, 5)).toBe(13)
    expect(leftoverPoints({ type: 'rank', rank: 5 }, 5)).toBe(WILD_POINTS)
    expect(leftoverPoints({ type: 'rank', rank: 13 }, 13)).toBe(WILD_POINTS)
  })

  it('always scores jokers at 50', () => {
    expect(leftoverPoints({ type: 'joker' }, 3)).toBe(JOKER_POINTS)
    expect(leftoverPoints({ type: 'joker' }, 13)).toBe(JOKER_POINTS)
  })

  it('adds leftover cards the way a scorekeeper would at the table', () => {
    const tokens = [
      { type: 'rank' as const, rank: 9 as const },
      { type: 'rank' as const, rank: 7 as const },
      { type: 'joker' as const },
    ]
    expect(tallyLeftovers(tokens, 7)).toBe(9 + WILD_POINTS + JOKER_POINTS)
  })
})
