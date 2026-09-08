export const PHASES = [
  { id: 1, label: '2 sets of 3' },
  { id: 2, label: '1 set of 3 + 1 run of 4' },
  { id: 3, label: '1 set of 4 + 1 run of 4' },
  { id: 4, label: '1 run of 7' },
  { id: 5, label: '1 run of 8' },
  { id: 6, label: '1 run of 9' },
  { id: 7, label: '2 sets of 4' },
  { id: 8, label: '7 cards of one color' },
  { id: 9, label: '1 set of 5 + 1 set of 2' },
  { id: 10, label: '1 set of 5 + 1 set of 3' },
] as const

export type PhaseId = (typeof PHASES)[number]['id']

export type Phase10Player = {
  id: string
  name: string
  colorIndex: number
  phase: number
}

export type Phase10RoundScore = {
  leftover: number | null
  completed: boolean | null
}

export type Phase10Round = Record<string, Phase10RoundScore>

export type Phase10Status = 'playing' | 'finished'

export type Phase10Game = {
  id: string
  createdAt: string
  players: Phase10Player[]
  rounds: Phase10Round[]
  currentRound: number
  status: Phase10Status
}

export type Phase10Record = Phase10Game & {
  finishedAt: string | null
  archivedAt: string
}

export type Phase10Screen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8
export const MAX_LEFTOVER = 250
export const CARDS_DEALT = 10

export const PLAYER_COLORS = [
  { id: 'red', hex: '#e84545', suit: '●' },
  { id: 'yellow', hex: '#f5c842', suit: '●' },
  { id: 'green', hex: '#2db86a', suit: '●' },
  { id: 'blue', hex: '#2b7cff', suit: '●' },
  { id: 'orange', hex: '#ff8a4c', suit: '●' },
  { id: 'violet', hex: '#8b5cf6', suit: '●' },
  { id: 'sky', hex: '#67e8f9', suit: '●' },
  { id: 'rose', hex: '#fb7185', suit: '●' },
] as const
