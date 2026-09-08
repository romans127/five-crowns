export type DealPlayer = {
  id: string
  name: string
  colorIndex: number
}

export type DealScore = {
  sets: number | null
  points: number | null
}

export type DealStatus = 'playing' | 'finished'

export type DealGame = {
  id: string
  createdAt: string
  players: DealPlayer[]
  scores: Record<string, DealScore>
  status: DealStatus
  winThreshold: number
}

export type DealRecord = DealGame & {
  finishedAt: string | null
  archivedAt: string
}

export type DealScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 5
export const MAX_SETS = 8
export const MAX_POINTS = 999
export const WIN_THRESHOLD = 3

export const PLAYER_COLORS = [
  { id: 'red', hex: '#e30613', suit: '♦' },
  { id: 'gold', hex: '#d4a017', suit: '♦' },
  { id: 'cream', hex: '#f4ead4', suit: '♦' },
  { id: 'ink', hex: '#1a1a1a', suit: '♦' },
  { id: 'green', hex: '#2e7a4f', suit: '♦' },
] as const
