import { gameComplete, lastPlacePlayers, winners } from './engine.ts'
import type { GameRecord } from './types.ts'

export type LeaderboardEntry = {
  name: string
  wins: number
  lastPlace: number
  gamesPlayed: number
}

type MutableEntry = LeaderboardEntry & { key: string }

export function playerNameKey(name: string): string {
  return name.trim().toLowerCase()
}

export function isLeaderboardGame(record: GameRecord): boolean {
  return record.status === 'finished' && gameComplete(record)
}

export function buildLeaderboard(records: GameRecord[]): LeaderboardEntry[] {
  const byKey = new Map<string, MutableEntry>()

  const touch = (name: string): MutableEntry => {
    const key = playerNameKey(name)
    const existing = byKey.get(key)
    if (existing) {
      return existing
    }
    const created: MutableEntry = {
      key,
      name: name.trim(),
      wins: 0,
      lastPlace: 0,
      gamesPlayed: 0,
    }
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

  return [...byKey.values()]
    .map(({ key: _key, ...entry }) => entry)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function sortByWins(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(
    (a, b) => b.wins - a.wins || b.gamesPlayed - a.gamesPlayed || a.name.localeCompare(b.name),
  )
}

export function sortByLastPlace(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(
    (a, b) => b.lastPlace - a.lastPlace || b.gamesPlayed - a.gamesPlayed || a.name.localeCompare(b.name),
  )
}

export function leaderboardHasStats(entries: LeaderboardEntry[]): boolean {
  return entries.some((entry) => entry.gamesPlayed > 0)
}
