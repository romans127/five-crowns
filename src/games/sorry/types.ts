export type SorryPlayer = {
  id: string
  name: string
  colorIndex: number
}

export type SorryScore = {
  pawnsHome: number | null
}

export type SorryStatus = 'playing' | 'finished'

export type SorryGame = {
  id: string
  createdAt: string
  players: SorryPlayer[]
  scores: Record<string, SorryScore>
  status: SorryStatus
  winThreshold: number
}

export type SorryRecord = SorryGame & {
  finishedAt: string | null
  archivedAt: string
}

export type SorryScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4
export const PAWNS_PER_PLAYER = 4
export const WIN_THRESHOLD = 4

export const PLAYER_COLORS = [
  { id: 'red', hex: '#e31c23', suit: '♟' },
  { id: 'blue', hex: '#1e5aa8', suit: '♟' },
  { id: 'yellow', hex: '#f5d000', suit: '♟' },
  { id: 'green', hex: '#2e9d4a', suit: '♟' },
] as const
