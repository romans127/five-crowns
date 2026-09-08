import { deleteCloudRecord, listCloudRecords, upsertCloudRecord } from '../../platform/sync.ts'
import { scoreComplete } from './engine.ts'
import type { TtrGame, TtrRecord } from './types.ts'

export const ACTIVE_KEY = 'ticket-to-ride:v1'
export const HISTORY_KEY = 'ticket-to-ride:history:v1'
export const MAX_HISTORY = 50

type ActiveStore = { version: 1; game: TtrGame | null }
type HistoryStore = { version: 1; records: TtrRecord[] }

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

export function loadGame(storage: Pick<Storage, 'getItem'> = localStorage): TtrGame | null {
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

export function saveGame(game: TtrGame | null, storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage): void {
  if (!game) {
    storage.removeItem(ACTIVE_KEY)
    return
  }
  storage.setItem(ACTIVE_KEY, JSON.stringify({ version: 1, game } satisfies ActiveStore))
  void upsertCloudRecord({
    id: game.id,
    gameType: 'ticket-to-ride',
    kind: game.status === 'finished' ? 'history' : 'active',
    payload: game,
  })
}

export function listHistory(storage: Pick<Storage, 'getItem'> = localStorage): TtrRecord[] {
  return readHistory(storage).records.sort(
    (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
  )
}

export function upsertHistory(
  game: TtrGame,
  options?: { finishedAt?: string | null },
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
): TtrRecord {
  const store = readHistory(storage)
  const record: TtrRecord = {
    ...game,
    finishedAt: options?.finishedAt !== undefined ? options.finishedAt : game.status === 'finished' ? new Date().toISOString() : null,
    archivedAt: new Date().toISOString(),
  }
  const records = [record, ...store.records.filter((entry) => entry.id !== game.id)].slice(0, MAX_HISTORY)
  storage.setItem(HISTORY_KEY, JSON.stringify({ version: 1, records } satisfies HistoryStore))
  void upsertCloudRecord({
    id: game.id,
    gameType: 'ticket-to-ride',
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

export function gameHasProgress(game: TtrGame): boolean {
  return game.players.some((player) => {
    const score = game.scores[player.id]
    return typeof score?.routes === 'number' || typeof score?.tickets === 'number' || typeof score?.longest === 'number'
  })
}

export function padsComplete(game: TtrGame): number {
  return game.players.filter((player) => scoreComplete(game.scores[player.id])).length
}

export function historyHeadline(record: TtrRecord): string {
  return record.players.map((player) => player.name).join(', ')
}

export function searchHistory(records: TtrRecord[], query: string): TtrRecord[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return records
  }
  return records.filter((record) => record.players.some((player) => player.name.toLowerCase().includes(needle)))
}

export function canResume(record: TtrRecord): boolean {
  return record.status === 'playing'
}

export function recordToGame(record: TtrRecord): TtrGame {
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

export async function hydrateFromCloud(): Promise<TtrRecord[]> {
  const rows = await listCloudRecords('ticket-to-ride', 'history')
  return rows
    .map((row) => row.payload as TtrRecord)
    .filter((record) => record && typeof record.id === 'string')
}
