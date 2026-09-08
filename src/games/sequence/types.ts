export type SequencePlayer = {
  id: string
  name: string
  colorIndex: number
}

export type SequenceScore = {
  sequences: number | null
}

export type SequenceStatus = 'playing' | 'finished'

export type SequenceMode = 'open' | 'teams'

export type SequenceGame = {
  id: string
  createdAt: string
  players: SequencePlayer[]
  scores: Record<string, SequenceScore>
  status: SequenceStatus
  mode: SequenceMode
  winThreshold: number
}

export type SequenceRecord = SequenceGame & {
  finishedAt: string | null
  archivedAt: string
}

export type SequenceScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const MAX_SEQUENCES = 5
export const OPEN_WIN_THRESHOLD = 2
export const TEAMS_WIN_THRESHOLD = 1

export const PLAYER_COLORS = [
  { id: 'blue', hex: '#2b6cff', suit: '●' },
  { id: 'green', hex: '#1f9d55', suit: '●' },
  { id: 'red', hex: '#e31c23', suit: '●' },
  { id: 'gold', hex: '#f2d15c', suit: '●' },
  { id: 'violet', hex: '#8b5cf6', suit: '●' },
  { id: 'sky', hex: '#67e8f9', suit: '●' },
] as const
