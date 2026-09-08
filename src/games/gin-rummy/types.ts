export type GinPlayer = {
  id: string
  name: string
  colorIndex: number
}

export type GinRoundScore = {
  leftover: number | null
  knocker: boolean
  gin: boolean
}

export type GinRound = Record<string, GinRoundScore>

export type GinStatus = 'playing' | 'finished'

export type GinGame = {
  id: string
  createdAt: string
  players: GinPlayer[]
  rounds: GinRound[]
  currentRound: number
  status: GinStatus
  winThreshold: number
}

export type GinRecord = GinGame & {
  finishedAt: string | null
  archivedAt: string
}

export type GinScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const MAX_DEADWOOD = 99
export const WIN_THRESHOLD = 100
export const GIN_BONUS = 25
export const UNDERCUT_BONUS = 25

export const PLAYER_COLORS = [
  { id: 'burgundy', hex: '#9b2c43', suit: '♥' },
  { id: 'cream', hex: '#f3e6d4', suit: '♦' },
  { id: 'navy', hex: '#6ea8fe', suit: '♠' },
  { id: 'forest', hex: '#3d8f62', suit: '♣' },
  { id: 'rose', hex: '#fb7185', suit: '♥' },
  { id: 'ink', hex: '#c5cdd6', suit: '♠' },
] as const
