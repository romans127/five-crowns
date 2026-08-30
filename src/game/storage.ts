import type { Game } from './types.ts'

export const STORAGE_KEY = 'five-crowns:v1'

type StoredShape = {
  version: 1
  game: Game | null
}

export function loadGame(storage: Pick<Storage, 'getItem'> = localStorage): Game | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as StoredShape
    if (parsed.version !== 1 || !parsed.game) {
      return null
    }
    return parsed.game
  } catch {
    return null
  }
}

export function saveGame(game: Game | null, storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage): void {
  if (!game) {
    storage.removeItem(STORAGE_KEY)
    return
  }
  const payload: StoredShape = { version: 1, game }
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
