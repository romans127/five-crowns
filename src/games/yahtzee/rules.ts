import type { CategoryId, UpperCategoryId } from './types.ts'

export const UPPER_BONUS_THRESHOLD = 63
export const UPPER_BONUS = 35
export const YAHTZEE_SCORE = 50
export const YAHTZEE_BONUS = 100
export const FULL_HOUSE_SCORE = 25
export const SMALL_STRAIGHT_SCORE = 30
export const LARGE_STRAIGHT_SCORE = 40
export const DICE_COUNT = 5
export const DIE_MAX = 6
export const SUM_ALL_MAX = DICE_COUNT * DIE_MAX

type CategoryRuleBase = {
  id: CategoryId
  label: string
  hint: string
}

export type UpperCategoryRule = CategoryRuleBase & {
  section: 'upper'
  kind: 'upper'
  face: 1 | 2 | 3 | 4 | 5 | 6
  max: number
}

export type SumCategoryRule = CategoryRuleBase & {
  section: 'lower'
  kind: 'sum'
  max: number
}

export type FixedCategoryRule = CategoryRuleBase & {
  section: 'lower'
  kind: 'fixed'
  fixedScore: number
  max: number
}

export type CategoryRule = UpperCategoryRule | SumCategoryRule | FixedCategoryRule

const upperRule = (id: UpperCategoryId, label: string, face: 1 | 2 | 3 | 4 | 5 | 6): UpperCategoryRule => ({
  id,
  label,
  section: 'upper',
  kind: 'upper',
  face,
  max: face * DICE_COUNT,
  hint: `Sum of ${face}s · three of them is ${face * 3} toward the 63 bonus`,
})

export const CATEGORY_RULES: Record<CategoryId, CategoryRule> = {
  aces: upperRule('aces', 'Aces', 1),
  twos: upperRule('twos', 'Twos', 2),
  threes: upperRule('threes', 'Threes', 3),
  fours: upperRule('fours', 'Fours', 4),
  fives: upperRule('fives', 'Fives', 5),
  sixes: upperRule('sixes', 'Sixes', 6),
  threeKind: {
    id: 'threeKind',
    label: '3 of a kind',
    section: 'lower',
    kind: 'sum',
    max: SUM_ALL_MAX,
    hint: 'At least three alike · score the total of all five dice',
  },
  fourKind: {
    id: 'fourKind',
    label: '4 of a kind',
    section: 'lower',
    kind: 'sum',
    max: SUM_ALL_MAX,
    hint: 'At least four alike · score the total of all five dice',
  },
  fullHouse: {
    id: 'fullHouse',
    label: 'Full house',
    section: 'lower',
    kind: 'fixed',
    fixedScore: FULL_HOUSE_SCORE,
    max: FULL_HOUSE_SCORE,
    hint: 'Three of one number + a pair · 25 points',
  },
  smallStraight: {
    id: 'smallStraight',
    label: 'Small straight',
    section: 'lower',
    kind: 'fixed',
    fixedScore: SMALL_STRAIGHT_SCORE,
    max: SMALL_STRAIGHT_SCORE,
    hint: 'Four in a row · 30 points',
  },
  largeStraight: {
    id: 'largeStraight',
    label: 'Large straight',
    section: 'lower',
    kind: 'fixed',
    fixedScore: LARGE_STRAIGHT_SCORE,
    max: LARGE_STRAIGHT_SCORE,
    hint: 'Five in a row · 40 points',
  },
  yahtzee: {
    id: 'yahtzee',
    label: 'Yahtzee',
    section: 'lower',
    kind: 'fixed',
    fixedScore: YAHTZEE_SCORE,
    max: YAHTZEE_SCORE,
    hint: 'Five of a kind · 50 points. Extra Yahtzees after this can add +100 each.',
  },
  chance: {
    id: 'chance',
    label: 'Chance',
    section: 'lower',
    kind: 'sum',
    max: SUM_ALL_MAX,
    hint: 'Any roll · score the total of all five dice',
  },
}

export const UPPER_RULES: UpperCategoryRule[] = (
  ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes'] as const
).map((id) => CATEGORY_RULES[id] as UpperCategoryRule)
export const LOWER_RULES = (
  ['threeKind', 'fourKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'] as const
).map((id) => CATEGORY_RULES[id])

export function categoryRule(id: CategoryId): CategoryRule {
  return CATEGORY_RULES[id]
}

export function clampCategoryScore(category: CategoryId, value: number): number {
  const rule = CATEGORY_RULES[category]
  if (!Number.isFinite(value)) {
    return 0
  }
  const rounded = Math.max(0, Math.round(value))
  switch (rule.kind) {
    case 'fixed':
      return rounded === 0 ? 0 : rule.fixedScore
    case 'upper':
      return Math.min(rule.max, rounded)
    case 'sum':
      return Math.min(rule.max, rounded)
    default: {
      const _never: never = rule
      return _never
    }
  }
}

export function bonusNeeded(upperSubtotal: number): number {
  return Math.max(0, UPPER_BONUS_THRESHOLD - upperSubtotal)
}
