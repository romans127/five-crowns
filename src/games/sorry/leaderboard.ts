import { lastPlacePlayers, winners } from './engine.ts'
import type { SorryRecord } from './types.ts'

export type LeaderboardEntry = {
  name: string
  wins: number
  lastPlace: number
  gamesPlayed: number
}

export function isLeaderboardGame(record: SorryRecord): boolean {
  return record.status === 'finished'
}

export function buildLeaderboard(records: SorryRecord[]): LeaderboardEntry[] {
  const byKey = new Map<string, LeaderboardEntry>()

  const touch = (name: string): LeaderboardEntry => {
    const key = name.trim().toLowerCase()
    const existing = byKey.get(key)
    if (existing) {
      return existing
    }
    const created = { name: name.trim(), wins: 0, lastPlace: 0, gamesPlayed: 0 }
    byKey.set(key, created)
    return created
  }

  for (const record of records) {
    if (!isLeaderboardGame(record)) {
      continue
    }
    for (const player of record.players) {
      touch(player.name).gamesPlayed += 1
    }
    for (const player of winners(record)) {
      touch(player.name).wins += 1
    }
    for (const player of lastPlacePlayers(record)) {
      touch(player.name).lastPlace += 1
    }
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortByWins(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.wins - a.wins || b.gamesPlayed - a.gamesPlayed || a.name.localeCompare(b.name))
}

export function sortByLastPlace(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(
    (a, b) => b.lastPlace - a.lastPlace || b.gamesPlayed - a.gamesPlayed || a.name.localeCompare(b.name),
  )
}
