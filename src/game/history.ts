import { gameComplete, handComplete } from './engine.ts'
import type { Game, GameRecord } from './types.ts'

export const HISTORY_KEY = 'five-crowns:history:v1'
export const MAX_HISTORY = 50

type HistoryStore = {
  version: 1
  records: GameRecord[]
}

function readStore(storage: Pick<Storage, 'getItem'>): HistoryStore {
  try {
    const raw = storage.getItem(HISTORY_KEY)
    if (!raw) {
      return { version: 1, records: [] }
    }
    const parsed = JSON.parse(raw) as HistoryStore
    if (parsed.version !== 1 || !Array.isArray(parsed.records)) {
      return { version: 1, records: [] }
    }
    return parsed
  } catch {
    return { version: 1, records: [] }
  }
}

function writeStore(store: HistoryStore, storage: Pick<Storage, 'setItem'>): void {
  storage.setItem(HISTORY_KEY, JSON.stringify(store))
}

export function listHistory(storage: Pick<Storage, 'getItem'> = localStorage): GameRecord[] {
  return readStore(storage).records.sort(
    (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
  )
}

export function getHistoryGame(id: string, storage: Pick<Storage, 'getItem'> = localStorage): GameRecord | null {
  return readStore(storage).records.find((record) => record.id === id) ?? null
}

export function upsertHistory(
  game: Game,
  options?: { finishedAt?: string | null },
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
): GameRecord {
  const store = readStore(storage)
  const finishedAt =
    options?.finishedAt !== undefined
      ? options.finishedAt
      : game.status === 'finished'
        ? new Date().toISOString()
        : null

  const record: GameRecord = {
    ...game,
    finishedAt,
    archivedAt: new Date().toISOString(),
  }

  const without = store.records.filter((entry) => entry.id !== game.id)
  const records = [record, ...without].slice(0, MAX_HISTORY)
  writeStore({ version: 1, records }, storage)
  return record
}

export function deleteHistoryGame(id: string, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): void {
  const store = readStore(storage)
  writeStore({ version: 1, records: store.records.filter((record) => record.id !== id) }, storage)
}

export function gameHasProgress(game: Game): boolean {
  return game.scores.some((round) => Object.values(round).some((score) => typeof score === 'number'))
}

export function handsRecorded(game: Game): number {
  return game.scores.filter((_, index) => handComplete(game, index)).length
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function historyHeadline(record: GameRecord): string {
  return record.players.map((player) => player.name).join(', ')
}

export function searchHistory(records: GameRecord[], query: string): GameRecord[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return records
  }
  return records.filter((record) => {
    const playerNames = record.players.map((player) => player.name.toLowerCase())
    const haystack = [
      historyHeadline(record).toLowerCase(),
      formatWhen(record.archivedAt).toLowerCase(),
      record.status,
      ...playerNames,
    ]
    return haystack.some((part) => part.includes(needle))
  })
}

export function canResumeFromHistory(record: GameRecord): boolean {
  return record.status === 'playing' || !gameComplete(record)
}

export function recordToGame(record: GameRecord): Game {
  const { finishedAt: _finishedAt, archivedAt: _archivedAt, ...game } = record
  return {
    ...game,
    status: gameComplete(game) ? 'finished' : 'playing',
  }
}
