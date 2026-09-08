export type CribbagePlayer = {
  id: string
  name: string
  colorIndex: number
}

export type CribbageRoundScore = {
  points: number | null
}

export type CribbageRound = Record<string, CribbageRoundScore>

export type CribbageStatus = 'playing' | 'finished'

export type CribbageGame = {
  id: string
  createdAt: string
  players: CribbagePlayer[]
  rounds: CribbageRound[]
  currentRound: number
  status: CribbageStatus
  winThreshold: number
}

export type CribbageRecord = CribbageGame & {
  finishedAt: string | null
  archivedAt: string
}

export type CribbageScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const MAX_HAND_POINTS = 121
export const WIN_THRESHOLD = 121

export const PLAYER_COLORS = [
  { id: 'brass', hex: '#d4a017', suit: '♟' },
  { id: 'forest', hex: '#2e7a56', suit: '♟' },
  { id: 'cream', hex: '#f4ead4', suit: '♟' },
  { id: 'mahogany', hex: '#c46a3a', suit: '♟' },
  { id: 'pine', hex: '#7cb342', suit: '♟' },
  { id: 'ink', hex: '#cfd8dc', suit: '♟' },
] as const
