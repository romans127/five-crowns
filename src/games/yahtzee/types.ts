export const UPPER_CATEGORY_IDS = ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes'] as const
export const LOWER_CATEGORY_IDS = [
  'threeKind',
  'fourKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yahtzee',
  'chance',
] as const
export const CATEGORY_IDS = [...UPPER_CATEGORY_IDS, ...LOWER_CATEGORY_IDS] as const

export type UpperCategoryId = (typeof UPPER_CATEGORY_IDS)[number]
export type LowerCategoryId = (typeof LOWER_CATEGORY_IDS)[number]
export type CategoryId = (typeof CATEGORY_IDS)[number]

export type YahtzeeScores = Record<CategoryId, number | null>

export type YahtzeePlayer = {
  id: string
  name: string
  colorIndex: number
  scores: YahtzeeScores
  yahtzeeBonuses: number
}

export type YahtzeeStatus = 'playing' | 'finished'

export type YahtzeeGame = {
  id: string
  createdAt: string
  players: YahtzeePlayer[]
  status: YahtzeeStatus
}

export type YahtzeeRecord = YahtzeeGame & {
  finishedAt: string | null
  archivedAt: string
}

export type YahtzeeScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8
export const CATEGORY_COUNT = CATEGORY_IDS.length
export const MAX_YAHTZEE_BONUSES = 12

export const PLAYER_COLORS = [
  { id: 'red', hex: '#d41224', suit: '⚄' },
  { id: 'yellow', hex: '#ffd400', suit: '⚅' },
  { id: 'ivory', hex: '#f4efe4', suit: '⚀' },
  { id: 'black', hex: '#d4d0c8', suit: '⚃' },
  { id: 'orange', hex: '#ff8a4c', suit: '⚂' },
  { id: 'green', hex: '#2db86a', suit: '⚁' },
  { id: 'blue', hex: '#3d8ef0', suit: '⚄' },
  { id: 'violet', hex: '#8b5cf6', suit: '⚅' },
] as const
