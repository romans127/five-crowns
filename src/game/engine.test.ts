import { describe, expect, it } from 'vitest'
import {
  advanceHand,
  clampScore,
  createGame,
  gameComplete,
  goToHand,
  handComplete,
  lastPlacePlayers,
  playerTotal,
  setHandScore,
  standings,
  winners,
} from './engine.ts'
import { saveGame, loadGame, STORAGE_KEY } from './storage.ts'

function memoryStorage(initial?: string) {
  const store = new Map<string, string>()
  if (initial) {
    store.set(STORAGE_KEY, initial)
  }
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

describe('createGame', () => {
  it('starts an 11-hand match for 2–8 named players', () => {
    const game = createGame(['  Ryan  ', 'Ada', ''])
    expect(game.players).toHaveLength(2)
    expect(game.players[0]?.name).toBe('Ryan')
    expect(game.scores).toHaveLength(11)
    expect(game.currentHand).toBe(0)
    expect(game.status).toBe('playing')
    expect(game.scores[0]?.[game.players[0]!.id]).toBeNull()
  })

  it('rejects a solo table', () => {
    expect(() => createGame(['Only'])).toThrow(/2–8/)
  })
})

describe('scoring a hand', () => {
  it('records leftover points and keeps a running total', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan, ada] = game.players
    game = setHandScore(game, 0, ryan!.id, 14)
    game = setHandScore(game, 0, ada!.id, 0)
    expect(handComplete(game, 0)).toBe(true)
    expect(playerTotal(game, ryan!.id)).toBe(14)
    expect(playerTotal(game, ada!.id)).toBe(0)
  })

  it('clamps wild keypad typos instead of exploding the sheet', () => {
    expect(clampScore(-4)).toBe(0)
    expect(clampScore(1400)).toBe(999)
    expect(clampScore(12.6)).toBe(13)
  })

  it('advances only after every player has a score', () => {
    let game = createGame(['Ryan', 'Ada'])
    const [ryan] = game.players
    game = setHandScore(game, 0, ryan!.id, 8)
    expect(advanceHand(game).currentHand).toBe(0)
    game = setHandScore(game, 0, game.players[1]!.id, 3)
    expect(advanceHand(game).currentHand).toBe(1)
  })
})

describe('winner', () => {
  it('crowns the lowest total and allows a shared crown', () => {
    let game = createGame(['Ryan', 'Ada'])
    for (let hand = 0; hand < 11; hand += 1) {
      game = setHandScore(game, hand, game.players[0]!.id, 10)
      game = setHandScore(game, hand, game.players[1]!.id, 10)
    }
    expect(gameComplete(game)).toBe(true)
    expect(game.status).toBe('finished')
    expect(winners(game)).toHaveLength(2)
    expect(standings(game)[0]?.total).toBe(110)

    game = setHandScore(game, 10, game.players[1]!.id, 0)
    expect(winners(game).map((player) => player.name)).toEqual(['Ada'])
  })

  it('finds everyone tied for the lantern', () => {
    let game = createGame(['Ryan', 'Ada'])
    for (let hand = 0; hand < 11; hand += 1) {
      game = setHandScore(game, hand, game.players[0]!.id, 12)
      game = setHandScore(game, hand, game.players[1]!.id, 12)
    }
    expect(lastPlacePlayers(game)).toHaveLength(2)
    expect(lastPlacePlayers(game).map((player) => player.name).sort()).toEqual(['Ada', 'Ryan'])
  })
})

describe('hand navigation and persistence', () => {
  it('lets you jump back to an earlier hand', () => {
    const game = goToHand(createGame(['Ryan', 'Ada']), 4)
    expect(game.currentHand).toBe(4)
    expect(goToHand(game, 99).currentHand).toBe(4)
  })

  it('round-trips the table through storage', () => {
    const storage = memoryStorage()
    const game = createGame(['Ryan', 'Ada'])
    saveGame(game, storage)
    const loaded = loadGame(storage)
    expect(loaded?.id).toBe(game.id)
    expect(loaded?.players.map((player) => player.name)).toEqual(['Ryan', 'Ada'])
    saveGame(null, storage)
    expect(loadGame(storage)).toBeNull()
  })
})
