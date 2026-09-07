import { HISTORY_KEY, listHistory } from '../game/history.ts'
import { loadGame, STORAGE_KEY } from '../game/storage.ts'
import { upsertCloudRecord } from './sync.ts'

export const IMPORT_FLAG_KEY = 'game-night:imported-five-crowns'

export type LocalFiveCrownsPeek = {
  active: boolean
  historyCount: number
}

export function peekLocalFiveCrowns(storage: Pick<Storage, 'getItem'> = localStorage): LocalFiveCrownsPeek {
  return {
    active: Boolean(loadGame(storage)),
    historyCount: listHistory(storage).length,
  }
}

export function hasLocalFiveCrowns(storage: Pick<Storage, 'getItem'> = localStorage): boolean {
  const peek = peekLocalFiveCrowns(storage)
  return peek.active || peek.historyCount > 0
}

export async function importLocalFiveCrowns(
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
): Promise<{ imported: number }> {
  const active = loadGame(storage)
  const history = listHistory(storage)
  const seen = new Set<string>()
  let imported = 0

  if (active) {
    await upsertCloudRecord({
      id: active.id,
      gameType: 'five-crowns',
      kind: 'active',
      payload: active,
    })
    seen.add(active.id)
    imported += 1
  }

  for (const record of history) {
    if (seen.has(record.id)) {
      continue
    }
    await upsertCloudRecord({
      id: record.id,
      gameType: 'five-crowns',
      kind: 'history',
      payload: record,
    })
    seen.add(record.id)
    imported += 1
  }

  storage.setItem(IMPORT_FLAG_KEY, new Date().toISOString())
  return { imported }
}

export function alreadyImported(storage: Pick<Storage, 'getItem'> = localStorage): boolean {
  return Boolean(storage.getItem(IMPORT_FLAG_KEY))
}

export function localFiveCrownsKeys(): string[] {
  return [STORAGE_KEY, HISTORY_KEY]
}
