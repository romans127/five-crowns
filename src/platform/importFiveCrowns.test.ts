import { describe, expect, it } from 'vitest'
import { createGame, setHandScore } from '../game/engine.ts'
import { HISTORY_KEY, upsertHistory } from '../game/history.ts'
import { STORAGE_KEY, saveGame } from '../game/storage.ts'
import { IMPORT_FLAG_KEY, hasLocalFiveCrowns, importLocalFiveCrowns, peekLocalFiveCrowns } from './importFiveCrowns.ts'

function memoryStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

describe('Five Crowns import', () => {
  it('finds local active and history games', () => {
    const storage = memoryStorage()
    let game = createGame(['Ryan', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 4)
    saveGame(game, storage)
    upsertHistory(game, { finishedAt: null }, storage)
    expect(hasLocalFiveCrowns(storage)).toBe(true)
    expect(peekLocalFiveCrowns(storage)).toEqual({ active: true, historyCount: 1 })
  })

  it('marks an import complete', async () => {
    const storage = memoryStorage()
    saveGame(createGame(['Ryan', 'Ada']), storage)
    const result = await importLocalFiveCrowns(storage)
    expect(result.imported).toBe(1)
    expect(storage.getItem(IMPORT_FLAG_KEY)).toBeTruthy()
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy()
    expect(storage.getItem(HISTORY_KEY)).toBeNull()
  })
})
