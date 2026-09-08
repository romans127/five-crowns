export const ROW_IDS = ['red', 'yellow', 'green', 'blue'] as const

export type QwixxRowId = (typeof ROW_IDS)[number]

export type QwixxPad = {
  red: number
  yellow: number
  green: number
  blue: number
  penalties: number
}

export type QwixxPlayer = {
  id: string
  name: string
  colorIndex: number
  pad: QwixxPad
}

export type QwixxStatus = 'playing' | 'finished'

export type QwixxGame = {
  id: string
  createdAt: string
  players: QwixxPlayer[]
  status: QwixxStatus
}

export type QwixxRecord = QwixxGame & {
  finishedAt: string | null
  archivedAt: string
}

export type QwixxScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 5
export const MAX_CROSSES = 12
export const MAX_PENALTIES = 4
export const LOCK_CROSSES = 5
export const PENALTY_POINTS = 5
export const LOCKOUTS_TO_END = 2

export const PLAYER_COLORS = [
  { id: 'red', hex: '#e31c23', suit: '✕' },
  { id: 'yellow', hex: '#f5c400', suit: '✕' },
  { id: 'green', hex: '#1f9d55', suit: '✕' },
  { id: 'blue', hex: '#2b6cff', suit: '✕' },
  { id: 'ink', hex: '#d6dbe4', suit: '✕' },
] as const
