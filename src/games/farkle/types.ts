export type FarklePlayer = {
  id: string
  name: string
  colorIndex: number
}

export type FarkleRoundScore = {
  points: number | null
  farkle: boolean
}

export type FarkleRound = Record<string, FarkleRoundScore>

export type FarkleStatus = 'playing' | 'finished'

export type FarkleGame = {
  id: string
  createdAt: string
  players: FarklePlayer[]
  rounds: FarkleRound[]
  currentRound: number
  status: FarkleStatus
  winThreshold: number
}

export type FarkleRecord = FarkleGame & {
  finishedAt: string | null
  archivedAt: string
}

export type FarkleScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8
export const MAX_TURN_POINTS = 10000
export const WIN_THRESHOLD = 10000

export const PLAYER_COLORS = [
  { id: 'amber', hex: '#f5b942', suit: '⚄' },
  { id: 'gold', hex: '#e6c36a', suit: '⚅' },
  { id: 'ivory', hex: '#f3efe6', suit: '⚀' },
  { id: 'walnut', hex: '#c48a4a', suit: '⚃' },
  { id: 'ember', hex: '#ff8a4c', suit: '⚂' },
  { id: 'pine', hex: '#7cb342', suit: '⚁' },
  { id: 'sky', hex: '#67e8f9', suit: '⚄' },
  { id: 'rose', hex: '#fb7185', suit: '⚅' },
] as const
