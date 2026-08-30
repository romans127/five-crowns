import { describe, expect, it } from 'vitest'
import { createGame, setHandScore } from './engine.ts'
import {
  deleteHistoryGame,
  gameHasProgress,
  getHistoryGame,
  HISTORY_KEY,
  listHistory,
  searchHistory,
  upsertHistory,
} from './history.ts'

function memoryStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

describe('game history', () => {
  it('stores finished games for later lookup', () => {
    const storage = memoryStorage()
    let game = createGame(['Ryan', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 4)
    game = setHandScore(game, 0, game.players[1]!.id, 0)
    upsertHistory({ ...game, status: 'finished' }, { finishedAt: '2026-08-30T12:00:00.000Z' }, storage)

    const records = listHistory(storage)
    expect(records).toHaveLength(1)
    expect(records[0]?.players.map((player) => player.name)).toEqual(['Ryan', 'Ada'])
    expect(records[0]?.finishedAt).toBe('2026-08-30T12:00:00.000Z')
    expect(getHistoryGame(game.id, storage)?.status).toBe('finished')
  })

  it('upserts by game id instead of duplicating entries', () => {
    const storage = memoryStorage()
    const game = createGame(['Ryan', 'Ada'])
    upsertHistory(game, undefined, storage)
    upsertHistory(game, undefined, storage)
    expect(listHistory(storage)).toHaveLength(1)
  })

  it('stores in-progress games with null finishedAt', () => {
    const storage = memoryStorage()
    let game = createGame(['Ryan', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 9)
    expect(gameHasProgress(game)).toBe(true)
    upsertHistory(game, { finishedAt: null }, storage)
    expect(listHistory(storage)[0]?.finishedAt).toBeNull()
    expect(listHistory(storage)[0]?.status).toBe('playing')
  })

  it('can remove a record from history', () => {
    const storage = memoryStorage()
    const game = createGame(['Ryan', 'Ada'])
    upsertHistory(game, undefined, storage)
    deleteHistoryGame(game.id, storage)
    expect(storage.getItem(HISTORY_KEY)).toContain('"records":[]')
  })

  it('filters history by player name', () => {
    const storage = memoryStorage()
    const first = createGame(['Alice', 'Bob'])
    const second = createGame(['Carol', 'Dave'])
    upsertHistory({ ...first, status: 'finished' }, undefined, storage)
    upsertHistory({ ...second, status: 'finished' }, undefined, storage)
    const records = listHistory(storage)
    expect(searchHistory(records, 'alice')).toHaveLength(1)
    expect(searchHistory(records, 'dave')).toHaveLength(1)
    expect(searchHistory(records, 'zzz')).toHaveLength(0)
    expect(searchHistory(records, '')).toHaveLength(2)
  })
})
