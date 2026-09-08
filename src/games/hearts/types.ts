export type HeartsPlayer = {
  id: string
  name: string
  colorIndex: number
}

export type HeartsRoundScore = {
  points: number | null
}

export type HeartsRound = Record<string, HeartsRoundScore>

export type HeartsStatus = 'playing' | 'finished'

export type HeartsGame = {
  id: string
  createdAt: string
  players: HeartsPlayer[]
  rounds: HeartsRound[]
  currentRound: number
  status: HeartsStatus
  loseThreshold: number
}

export type HeartsRecord = HeartsGame & {
  finishedAt: string | null
  archivedAt: string
}

export type HeartsScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const MAX_ROUND_POINTS = 26
export const LOSE_THRESHOLD = 100
export const HEART_POINTS = 1
export const QUEEN_SPADES = 13

export const PLAYER_COLORS = [
  { id: 'heart', hex: '#d61f26', suit: '♥' },
  { id: 'spade', hex: '#e8eef2', suit: '♠' },
  { id: 'felt', hex: '#3d8f62', suit: '♣' },
  { id: 'gold', hex: '#e0b44c', suit: '♦' },
  { id: 'rose', hex: '#fb7185', suit: '♥' },
  { id: 'ink', hex: '#9aa4b2', suit: '♠' },
] as const
