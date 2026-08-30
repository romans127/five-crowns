import { describe, expect, it } from 'vitest'
import { loadPadMode, PAD_MODE_KEY, savePadMode } from './preferences.ts'

function memoryStorage(initial?: Record<string, string>) {
  const store = new Map(Object.entries(initial ?? {}))
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

describe('pad mode preference', () => {
  it('defaults to tap cards', () => {
    expect(loadPadMode(memoryStorage())).toBe('cards')
  })

  it('remembers keypad across sessions', () => {
    const storage = memoryStorage()
    savePadMode('keypad', storage)
    expect(storage.getItem(PAD_MODE_KEY)).toBe('keypad')
    expect(loadPadMode(storage)).toBe('keypad')
  })

  it('ignores corrupted values', () => {
    expect(loadPadMode(memoryStorage({ [PAD_MODE_KEY]: 'numpad' }))).toBe('cards')
  })
})
