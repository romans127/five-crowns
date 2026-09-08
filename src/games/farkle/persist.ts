import { deleteCloudRecord, listCloudRecords, upsertCloudRecord } from '../../platform/sync.ts'
import { roundComplete } from './engine.ts'
import type { FarkleGame, FarkleRecord } from './types.ts'

export const ACTIVE_KEY = 'farkle:v1'
export const HISTORY_KEY = 'farkle:history:v1'
export const MAX_HISTORY = 50

type ActiveStore = { version: 1; game: FarkleGame | null }
type HistoryStore = { version: 1; records: FarkleRecord[] }

function readHistory(storage: Pick<Storage, 'getItem'>): HistoryStore {
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

export function loadGame(storage: Pick<Storage, 'getItem'> = localStorage): FarkleGame | null {
  try {
    const raw = storage.getItem(ACTIVE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as ActiveStore
    return parsed.version === 1 ? parsed.game : null
  } catch {
    return null
  }
}

export function saveGame(game: FarkleGame | null, storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage): void {
  if (!game) {
    storage.removeItem(ACTIVE_KEY)
    return
  }
  storage.setItem(ACTIVE_KEY, JSON.stringify({ version: 1, game } satisfies ActiveStore))
  void upsertCloudRecord({
    id: game.id,
    gameType: 'farkle',
    kind: game.status === 'finished' ? 'history' : 'active',
    payload: game,
  })
}

export function listHistory(storage: Pick<Storage, 'getItem'> = localStorage): FarkleRecord[] {
  return readHistory(storage).records.sort(
    (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
  )
}

export function upsertHistory(
  game: FarkleGame,
  options?: { finishedAt?: string | null },
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
): FarkleRecord {
  const store = readHistory(storage)
  const record: FarkleRecord = {
    ...game,
    finishedAt: options?.finishedAt !== undefined ? options.finishedAt : game.status === 'finished' ? new Date().toISOString() : null,
    archivedAt: new Date().toISOString(),
  }
  const records = [record, ...store.records.filter((entry) => entry.id !== game.id)].slice(0, MAX_HISTORY)
  storage.setItem(HISTORY_KEY, JSON.stringify({ version: 1, records } satisfies HistoryStore))
  void upsertCloudRecord({
    id: game.id,
    gameType: 'farkle',
    kind: 'history',
    payload: record,
  })
  return record
}

export function deleteHistoryGame(id: string, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): void {
  const store = readHistory(storage)
  storage.setItem(
    HISTORY_KEY,
    JSON.stringify({ version: 1, records: store.records.filter((record) => record.id !== id) } satisfies HistoryStore),
  )
  void deleteCloudRecord(id)
}

export function gameHasProgress(game: FarkleGame): boolean {
  return game.rounds.some((round) =>
    Object.values(round).some((score) => typeof score.points === 'number' || score.farkle),
  )
}

export function handsRecorded(game: FarkleGame): number {
  return game.rounds.filter((_, index) => roundComplete(game, index)).length
}

export function historyHeadline(record: FarkleRecord): string {
  return record.players.map((player) => player.name).join(', ')
}

export function searchHistory(records: FarkleRecord[], query: string): FarkleRecord[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return records
  }
  return records.filter((record) => record.players.some((player) => player.name.toLowerCase().includes(needle)))
}

export function canResume(record: FarkleRecord): boolean {
  return record.status === 'playing'
}

export function recordToGame(record: FarkleRecord): FarkleGame {
  const { finishedAt: _finishedAt, archivedAt: _archivedAt, ...game } = record
  return game
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

export async function hydrateFromCloud(): Promise<FarkleRecord[]> {
  const rows = await listCloudRecords('farkle', 'history')
  return rows
    .map((row) => row.payload as FarkleRecord)
    .filter((record) => record && typeof record.id === 'string')
}
